import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { loginUser } from '../services/auth.service.js';
import { Role, MoaPosition, MoaRole, MoaSector, MoaLeadExecutive } from '@prisma/client';

// @desc    Register new staff user
// @route   POST /api/auth/register
// @access  Public (Should be Restricted to Super Admin in production)
export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    fullName,
    username,
    email,
    phoneNumber,
    password,
    role,
    regionId,
    zoneId,
    woredaId,
    kebeleId,
    pcId,
    unionId,
    moaPosition,
    moaRole,
    moaSector,
    moaLeadExecutive,
    moaDesk,
  } = req.body;

  // Handle profile picture upload via Cloudinary
  const profilePictureUrl = req.file ? req.file.path : null;

  // 1. Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }, { phoneNumber }] },
  });

  if (existingUser) {
    res.status(400);
    throw new Error('User with this email, username, or phone already exists');
  }

  // 2. Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Create the user
  const newUser = await prisma.user.create({
    data: {
      fullName,
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      profilePictureUrl,
      role: role as Role,
      regionId,
      zoneId,
      woredaId,
      kebeleId,
      pcId,
      unionId,
      moaPosition: moaPosition as MoaPosition,
      moaRole: moaRole as MoaRole,
      moaSector: moaSector as MoaSector,
      moaLeadExecutive: moaLeadExecutive as MoaLeadExecutive,
      moaDesk,
    },
  });

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    message: 'User registered successfully',
    user: userWithoutPassword,
  });
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    res.status(400);
    throw new Error('Please provide phoneNumber and password');
  }

  const user = await loginUser(phoneNumber, password);

  // Set cookie
  res.cookie("token", user.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json(user);
});

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});
