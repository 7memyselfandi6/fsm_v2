import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: Role;
  regionId?: string;
  zoneId?: string;
  woredaId?: string;
  kebeleId?: string;
  pcId?: string;
  unionId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
