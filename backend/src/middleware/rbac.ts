import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    next();
  };
};

export const requireOwner = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isOwner) {
    return res.status(403).json({ success: false, error: 'Owner access required' });
  }
  next();
};
