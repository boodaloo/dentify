import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        clinicId: string;
        role: UserRole;
        isOwner: boolean;
      };
    }
  }
}

export {};
