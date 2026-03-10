import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

// ============================================================
// Categories
// ============================================================

export const getCategories = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    const categories = await prisma.serviceCategory.findMany({
      where: { clinicId, isDeleted: false },
      include: { _count: { select: { services: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    return R.ok(res, categories);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, sortOrder } = req.body;

    if (!name) return R.error(res, 'Name is required');

    const category = await prisma.serviceCategory.create({
      data: { clinicId, name, sortOrder: sortOrder ?? 0 },
    });

    return R.created(res, category);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;
    const { name, sortOrder, isActive } = req.body;

    const existing = await prisma.serviceCategory.findFirst({
      where: { id, clinicId, isDeleted: false },
    });
    if (!existing) return R.error(res, 'Category not found', 404);

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        name:      name      ?? undefined,
        sortOrder: sortOrder ?? undefined,
        isActive:  isActive  ?? undefined,
      },
    });

    return R.ok(res, category);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.serviceCategory.findFirst({
      where: { id, clinicId, isDeleted: false },
    });
    if (!existing) return R.error(res, 'Category not found', 404);

    // Проверяем нет ли активных услуг в категории
    const servicesCount = await prisma.service.count({
      where: { categoryId: id, isDeleted: false },
    });
    if (servicesCount > 0) {
      return R.error(res, 'Cannot delete category with active services');
    }

    await prisma.serviceCategory.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return R.ok(res, { id });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Services
// ============================================================

export const getServices = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { search, categoryId, isActive } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId, isDeleted: false };
    if (search)     where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { code: { contains: search as string, mode: 'insensitive' } },
    ];
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category:    { select: { id: true, name: true } },
          branchPrices:{ include: { branch: { select: { id: true, name: true } } } },
        },
        orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return R.paginated(res, services, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const service = await prisma.service.findFirst({
      where: { id, clinicId, isDeleted: false },
      include: {
        category:        { select: { id: true, name: true } },
        branchPrices:    { include: { branch: { select: { id: true, name: true } } } },
        serviceMaterials:{ include: { material: { select: { id: true, name: true, unit: { select: { shortName: true } } } } } },
      },
    });

    if (!service) return R.error(res, 'Service not found', 404);
    return R.ok(res, service);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, code, description, categoryId, price, durationMinutes, color } = req.body;

    if (!name || price === undefined) return R.error(res, 'Name and price are required');

    const service = await prisma.service.create({
      data: {
        clinicId,
        name,
        code:           code           || null,
        description:    description    || null,
        categoryId:     categoryId     || null,
        price,
        durationMinutes:durationMinutes ?? 30,
        color:          color          || null,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return R.created(res, service);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.service.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Service not found', 404);

    const { name, code, description, categoryId, price, durationMinutes, color, isActive } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        name:           name           ?? undefined,
        code:           code           ?? undefined,
        description:    description    ?? undefined,
        categoryId:     categoryId     ?? undefined,
        price:          price          ?? undefined,
        durationMinutes:durationMinutes ?? undefined,
        color:          color          ?? undefined,
        isActive:       isActive       ?? undefined,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return R.ok(res, service);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.service.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Service not found', 404);

    await prisma.service.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return R.ok(res, { id });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Branch prices
// ============================================================

export const getBranchPrices = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const service = await prisma.service.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!service) return R.error(res, 'Service not found', 404);

    const prices = await prisma.serviceBranchPrice.findMany({
      where: { serviceId: id },
      include: { branch: { select: { id: true, name: true } } },
    });

    return R.ok(res, prices);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const upsertBranchPrice = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;
    const { branchId, price, validFrom, validTo } = req.body;

    if (!branchId || price === undefined) return R.error(res, 'branchId and price are required');

    const service = await prisma.service.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!service) return R.error(res, 'Service not found', 404);

    // Проверяем что филиал принадлежит этой клинике
    const branch = await prisma.branch.findFirst({ where: { id: branchId, clinicId } });
    if (!branch) return R.error(res, 'Branch not found', 404);

    const branchPrice = await prisma.serviceBranchPrice.upsert({
      where: { serviceId_branchId: { serviceId: id, branchId } },
      create: { serviceId: id, branchId, price, validFrom: validFrom ? new Date(validFrom) : null, validTo: validTo ? new Date(validTo) : null },
      update: { price, validFrom: validFrom ? new Date(validFrom) : null, validTo: validTo ? new Date(validTo) : null },
      include: { branch: { select: { id: true, name: true } } },
    });

    return R.ok(res, branchPrice);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteBranchPrice = async (req: Request, res: Response) => {
  try {
    const { id, branchId } = req.params;
    const clinicId         = req.user!.clinicId;

    const service = await prisma.service.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!service) return R.error(res, 'Service not found', 404);

    await prisma.serviceBranchPrice.delete({
      where: { serviceId_branchId: { serviceId: id, branchId } },
    });

    return R.ok(res, { serviceId: id, branchId });
  } catch (err) {
    return R.serverError(res, err);
  }
};
