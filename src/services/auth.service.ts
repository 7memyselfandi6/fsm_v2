import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { Role } from '@prisma/client';

export const loginUser = async (phoneNumber: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      phoneNumber,
    },
    include: {
      region: true,
      zone: true,
      woreda: true,
      kebele: true,
      pc: true,
      union: true,
    },
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      ...userWithoutPassword,
      token: generateToken(user.id),
    };
  } else {
    throw new Error('Invalid credentials');
  }
};

export const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};
