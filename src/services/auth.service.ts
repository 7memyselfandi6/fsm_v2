import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { Role } from '@prisma/client';

export const loginUser = async (identifier: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier },
        { phoneNumber: identifier },
      ],
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
    
    // Construct geographic context based on role
    const geoContext: any = {
      role: user.role,
      profilePictureUrl: user.profilePictureUrl,
    };

    if (user.kebeleId) geoContext.kebeleId = user.kebeleId;
    if (user.woredaId) geoContext.woredaId = user.woredaId;
    if (user.zoneId) geoContext.zoneId = user.zoneId;
    if (user.regionId) geoContext.regionId = user.regionId;
    if (user.pcId) geoContext.pcId = user.pcId;
    if (user.unionId) geoContext.unionId = user.unionId;

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
