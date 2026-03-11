import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { generateToken } from '../utils/jwt';
import * as R from '../utils/response';

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, clinicName } = req.body;
    if (!email || !password || !name || !clinicName) {
      return R.error(res, 'All fields are required');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return R.error(res, 'Email already in use');

    const hashed = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, password: hashed, name },
      });
      const clinic = await tx.clinic.create({ data: { name: clinicName } });
      const userClinic = await tx.userClinic.create({
        data: { userId: user.id, clinicId: clinic.id, role: 'OWNER', isOwner: true, isActive: true },
      });
      // Create a default main branch for every new clinic
      await tx.branch.create({
        data: { clinicId: clinic.id, name: clinicName, shortCode: 'MAIN', isMain: true },
      });
      return { user, clinic, userClinic };
    });

    const token = generateToken({
      userId:   result.user.id,
      email:    result.user.email,
      clinicId: result.clinic.id,
      role:     result.userClinic.role,
      isOwner:  result.userClinic.isOwner,
    });

    return R.created(res, {
      token,
      user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.userClinic.role, clinicId: result.clinic.id },
    });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, clinicId } = req.body;
    if (!email || !password) return R.error(res, 'Email and password are required');

    const user = await prisma.user.findUnique({
      where: { email },
      include: { userClinics: { include: { clinic: true } } },
    });

    if (!user) return R.error(res, 'Invalid credentials', 401);
    if (user.lockedUntil && user.lockedUntil > new Date()) return R.error(res, 'Account is temporarily locked', 403);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: { increment: 1 } } });
      return R.error(res, 'Invalid credentials', 401);
    }

    const membership = clinicId
      ? user.userClinics.find((uc) => uc.clinicId === clinicId && uc.isActive)
      : user.userClinics.find((uc) => uc.isActive);

    if (!membership) return R.error(res, 'No access to this clinic', 403);

    await prisma.user.update({ where: { id: user.id }, data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } });

    const token = generateToken({
      userId:   user.id,
      email:    user.email,
      clinicId: membership.clinicId,
      role:     membership.role,
      isOwner:  membership.isOwner,
    });

    return R.ok(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, role: membership.role, isOwner: membership.isOwner, clinicId: membership.clinicId, clinicName: membership.clinic.name },
      clinics: user.userClinics.filter((uc) => uc.isActive).map((uc) => ({ id: uc.clinicId, name: uc.clinic.name, role: uc.role })),
    });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// POST /api/auth/switch-clinic
export const switchClinic = async (req: Request, res: Response) => {
  try {
    const { clinicId } = req.body;
    const userId = req.user!.userId;

    const membership = await prisma.userClinic.findUnique({
      where: { userId_clinicId: { userId, clinicId } },
      include: { clinic: true },
    });

    if (!membership || !membership.isActive) return R.error(res, 'No access to this clinic', 403);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const token = generateToken({ userId, email: user!.email, clinicId: membership.clinicId, role: membership.role, isOwner: membership.isOwner });

    return R.ok(res, { token, clinicId: membership.clinicId, clinicName: membership.clinic.name, role: membership.role });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// GET /api/auth/me
export const me = async (req: Request, res: Response) => {
  try {
    const { userId, clinicId } = req.user!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userClinics: { where: { clinicId }, include: { clinic: true, specialization: true } } },
    });

    if (!user) return R.error(res, 'User not found', 404);
    const m = user.userClinics[0];

    return R.ok(res, { id: user.id, name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl, title: user.title, role: m?.role, isOwner: m?.isOwner, clinicId, clinicName: m?.clinic.name, specialization: m?.specialization });
  } catch (err) {
    return R.serverError(res, err);
  }
};
