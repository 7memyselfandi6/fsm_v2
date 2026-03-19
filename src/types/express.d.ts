import { Request } from 'express';
import { Role } from '@prisma/client';

export interface ScopingUser {
  role: Role;
  regionId?: string;
  zoneId?: string;
  woredaId?: string;
  kebeleId?: string;
  pcId?: string;
  unionId?: string;
}

export interface AuthenticatedUser extends ScopingUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
