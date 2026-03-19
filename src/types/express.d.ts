import { Request } from 'express';

interface AuthenticatedUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'SUPER_ADMIN' | 'FEDERAL' | 'REGION' | 'ZONE' | 'WOREDA' | 'KEBELE';
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
