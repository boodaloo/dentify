import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = header.split(' ')[1];
  const decoded = verifyToken(token) as any;
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }

  req.user = {
    userId:   decoded.userId,
    email:    decoded.email,
    clinicId: decoded.clinicId,
    role:     decoded.role,
    isOwner:  decoded.isOwner,
  };

  next();
};
