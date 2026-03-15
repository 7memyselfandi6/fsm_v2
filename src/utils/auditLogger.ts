import type { Request, Response, NextFunction } from 'express';

export const auditLog = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id || 'anonymous';
    const role = req.user?.role || 'none';
    const timestamp = new Date().toISOString();
    
    console.log(`[AUDIT] ${timestamp} | User: ${userId} | Role: ${role} | Action: ${action} | URL: ${req.originalUrl} | Query: ${JSON.stringify(req.query)}`);
    
    next();
  };
};
