import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';

interface DecodedToken {
  id: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 1. Check cookies for token
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // 2. Fallback to Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          fullName: true,
          username: true,
          email: true,
          role: true,
          regionId: true,
          zoneId: true,
          woredaId: true,
          kebeleId: true,
          pcId: true,
          unionId: true,
        },
      });

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role ${req.user?.role} is not authorized to access this route`);
    }
    next();
  };
};

export { protect, authorizeRole };
