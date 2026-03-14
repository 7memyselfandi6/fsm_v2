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

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!process.env.JWT_SECRET) {
        res.status(500);
        throw new Error('JWT_SECRET is not defined');
      }
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        res.status(500);
        throw new Error('JWT_SECRET is not defined');
      }
      const decoded = jwt.verify(token!, secret as string) as unknown as DecodedToken;

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
