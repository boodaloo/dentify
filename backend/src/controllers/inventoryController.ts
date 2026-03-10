import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

// ============================================================
// Units
// ============================================================

export const getUnits = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const units = await prisma.unit.findMany({
      where: { clinicId, isActive: true },
      orderBy: { name: 'asc' },
    });
    return R.ok(res, units);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createUnit = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, shortName } = req.body;
    if (!name) return R.error(res, 'Name is required');

    const unit = await prisma.unit.create({ data: { clinicId, name, shortName } });
    return R.created(res, unit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateUnit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { name, shortName, isActive } = req.body;

    const existing = await prisma.unit.findFirst({ where: { id, clinicId } });
    if (!existing) return R.error(res, 'Unit not found', 404);

    const unit = await prisma.unit.update({
      where: { id },
      data: { name: name ?? undefined, shortName: shortName ?? undefined, isActive: isActive ?? undefined },
    });
    return R.ok(res, unit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Material Categories
// ============================================================

export const getMaterialCategories = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const categories = await prisma.materialCategory.findMany({
      where: { clinicId, isActive: true },
      include: { _count: { select: { materials: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return R.ok(res, categories);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createMaterialCategory = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, sortOrder } = req.body;
    if (!name) return R.error(res, 'Name is required');

    const category = await prisma.materialCategory.create({
      data: { clinicId, name, sortOrder: sortOrder ?? 0 },
    });
    return R.created(res, category);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateMaterialCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { name, sortOrder, isActive } = req.body;

    const existing = await prisma.materialCategory.findFirst({ where: { id, clinicId } });
    if (!existing) return R.error(res, 'Category not found', 404);

    const category = await prisma.materialCategory.update({
      where: { id },
      data: { name: name ?? undefined, sortOrder: sortOrder ?? undefined, isActive: isActive ?? undefined },
    });
    return R.ok(res, category);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Contractors
// ============================================================

export const getContractors = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { type } = req.query;

    const contractors = await prisma.contractor.findMany({
      where: { clinicId, isActive: true, ...(type ? { type: type as any } : {}) },
      orderBy: { name: 'asc' },
    });
    return R.ok(res, contractors);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createContractor = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, type, inn, contactPerson, phone, email, address, notes } = req.body;
    if (!name) return R.error(res, 'Name is required');

    const contractor = await prisma.contractor.create({
      data: { clinicId, name, type: type ?? 'SUPPLIER', inn, contactPerson, phone, email, address, notes },
    });
    return R.created(res, contractor);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateContractor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { name, type, inn, contactPerson, phone, email, address, notes, isActive } = req.body;

    const existing = await prisma.contractor.findFirst({ where: { id, clinicId } });
    if (!existing) return R.error(res, 'Contractor not found', 404);

    const contractor = await prisma.contractor.update({
      where: { id },
      data: {
        name: name ?? undefined,
        type: type ?? undefined,
        inn: inn ?? undefined,
        contactPerson: contactPerson ?? undefined,
        phone: phone ?? undefined,
        email: email ?? undefined,
        address: address ?? undefined,
        notes: notes ?? undefined,
        isActive: isActive ?? undefined,
      },
    });
    return R.ok(res, contractor);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Materials
// ============================================================

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { search, categoryId, isActive } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId };
    if (search) where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { sku: { contains: search as string, mode: 'insensitive' } },
    ];
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          unit: { select: { id: true, name: true, shortName: true } },
          defaultContractor: { select: { id: true, name: true } },
          stock: { include: { branch: { select: { id: true, name: true } } } },
        },
        orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.material.count({ where }),
    ]);

    return R.paginated(res, materials, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getMaterialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const material = await prisma.material.findFirst({
      where: { id, clinicId },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, shortName: true } },
        defaultContractor: { select: { id: true, name: true } },
        stock: { include: { branch: { select: { id: true, name: true } } } },
      },
    });

    if (!material) return R.error(res, 'Material not found', 404);
    return R.ok(res, material);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, sku, categoryId, unitId, minStock, defaultContractorId } = req.body;
    if (!name) return R.error(res, 'Name is required');

    const material = await prisma.material.create({
      data: {
        clinicId,
        name,
        sku: sku || null,
        categoryId: categoryId || null,
        unitId: unitId || null,
        minStock: minStock ?? 0,
        defaultContractorId: defaultContractorId || null,
      },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, shortName: true } },
      },
    });

    return R.created(res, material);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.material.findFirst({ where: { id, clinicId } });
    if (!existing) return R.error(res, 'Material not found', 404);

    const { name, sku, categoryId, unitId, minStock, defaultContractorId, isActive } = req.body;

    const material = await prisma.material.update({
      where: { id },
      data: {
        name: name ?? undefined,
        sku: sku ?? undefined,
        categoryId: categoryId ?? undefined,
        unitId: unitId ?? undefined,
        minStock: minStock ?? undefined,
        defaultContractorId: defaultContractorId ?? undefined,
        isActive: isActive ?? undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        unit: { select: { id: true, name: true, shortName: true } },
      },
    });

    return R.ok(res, material);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Stock (current quantities per branch)
// ============================================================

export const getStock = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { branchId, lowStock } = req.query;

    const where: any = { clinicId };
    if (branchId) where.branchId = branchId;

    let stock = await prisma.materialStock.findMany({
      where,
      include: {
        material: {
          include: {
            category: { select: { id: true, name: true } },
            unit: { select: { id: true, name: true, shortName: true } },
          },
        },
        branch: { select: { id: true, name: true } },
      },
      orderBy: [{ material: { name: 'asc' } }],
    });

    // Filter low stock (quantity <= minStock)
    if (lowStock === 'true') {
      stock = stock.filter(s => Number(s.quantity) <= Number(s.material.minStock));
    }

    return R.ok(res, stock);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Stock Movements
// ============================================================

export const getMovements = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { materialId, branchId, type, from, to } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId };
    if (materialId) where.materialId = materialId;
    if (branchId) where.branchId = branchId;
    if (type) where.type = type;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          material: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
          contractor: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return R.paginated(res, movements, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createMovement = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { materialId, branchId, type, quantity, contractorId, transferToBranchId, notes, sourceType, sourceId } = req.body;

    if (!materialId || !branchId || !type || quantity === undefined) {
      return R.error(res, 'materialId, branchId, type, and quantity are required');
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return R.error(res, 'quantity must be positive');

    // Get or create stock record
    let stockRecord = await prisma.materialStock.findUnique({
      where: { materialId_branchId: { materialId, branchId } },
    });

    const quantityBefore = stockRecord ? Number(stockRecord.quantity) : 0;
    let quantityAfter: number;

    switch (type) {
      case 'IN':
        quantityAfter = quantityBefore + qty;
        break;
      case 'OUT':
        if (quantityBefore < qty) return R.error(res, 'Insufficient stock');
        quantityAfter = quantityBefore - qty;
        break;
      case 'ADJUSTMENT':
        quantityAfter = qty; // qty is the new absolute value for adjustments
        break;
      case 'TRANSFER':
        if (!transferToBranchId) return R.error(res, 'transferToBranchId is required for TRANSFER');
        if (quantityBefore < qty) return R.error(res, 'Insufficient stock');
        quantityAfter = quantityBefore - qty;
        break;
      default:
        return R.error(res, 'Invalid movement type');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create movement
      const movement = await tx.stockMovement.create({
        data: {
          clinicId,
          materialId,
          branchId,
          type,
          quantity: type === 'ADJUSTMENT' ? qty - quantityBefore : qty,
          quantityBefore,
          quantityAfter,
          contractorId: contractorId || null,
          transferToBranchId: transferToBranchId || null,
          notes: notes || null,
          sourceType: sourceType || null,
          sourceId: sourceId || null,
          createdByUserId: userId,
        },
      });

      // Upsert source stock
      await tx.materialStock.upsert({
        where: { materialId_branchId: { materialId, branchId } },
        create: { clinicId, materialId, branchId, quantity: quantityAfter, updatedByUserId: userId },
        update: { quantity: quantityAfter, updatedByUserId: userId },
      });

      // For TRANSFER: add to destination branch
      if (type === 'TRANSFER' && transferToBranchId) {
        const destStock = await tx.materialStock.findUnique({
          where: { materialId_branchId: { materialId, branchId: transferToBranchId } },
        });
        const destBefore = destStock ? Number(destStock.quantity) : 0;
        const destAfter = destBefore + qty;

        await tx.materialStock.upsert({
          where: { materialId_branchId: { materialId, branchId: transferToBranchId } },
          create: { clinicId, materialId, branchId: transferToBranchId, quantity: destAfter, updatedByUserId: userId },
          update: { quantity: destAfter, updatedByUserId: userId },
        });

        // Create incoming movement for destination
        await tx.stockMovement.create({
          data: {
            clinicId,
            materialId,
            branchId: transferToBranchId,
            type: 'IN',
            quantity: qty,
            quantityBefore: destBefore,
            quantityAfter: destAfter,
            sourceType: 'TRANSFER',
            sourceId: movement.id,
            notes: notes || null,
            createdByUserId: userId,
          },
        });
      }

      return movement;
    });

    return R.created(res, result);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Stock Receipts (incoming from suppliers)
// ============================================================

export const getReceipts = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { branchId, contractorId, from, to } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId };
    if (branchId) where.branchId = branchId;
    if (contractorId) where.contractorId = contractorId;
    if (from || to) {
      where.receiptDate = {};
      if (from) where.receiptDate.gte = new Date(from as string);
      if (to) where.receiptDate.lte = new Date(to as string);
    }

    const [receipts, total] = await Promise.all([
      prisma.stockReceipt.findMany({
        where,
        include: {
          branch: { select: { id: true, name: true } },
          contractor: { select: { id: true, name: true } },
          items: {
            include: { material: { select: { id: true, name: true } } },
          },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { receiptDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stockReceipt.count({ where }),
    ]);

    return R.paginated(res, receipts, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createReceipt = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { branchId, contractorId, receiptNumber, receiptDate, notes, items } = req.body;

    if (!branchId || !receiptDate || !items || !Array.isArray(items) || items.length === 0) {
      return R.error(res, 'branchId, receiptDate, and items are required');
    }

    const totalAmount = items.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

    const receipt = await prisma.$transaction(async (tx) => {
      const rec = await tx.stockReceipt.create({
        data: {
          clinicId,
          branchId,
          contractorId: contractorId || null,
          receiptNumber: receiptNumber || null,
          receiptDate: new Date(receiptDate),
          totalAmount,
          notes: notes || null,
          createdByUserId: userId,
          items: {
            create: items.map((item: any) => ({
              materialId: item.materialId,
              quantity: item.quantity,
              price: item.price,
              amount: item.amount,
            })),
          },
        },
        include: {
          items: { include: { material: { select: { id: true, name: true } } } },
        },
      });

      // Update stock for each item
      for (const item of items) {
        const existing = await tx.materialStock.findUnique({
          where: { materialId_branchId: { materialId: item.materialId, branchId } },
        });
        const quantityBefore = existing ? Number(existing.quantity) : 0;
        const quantityAfter = quantityBefore + Number(item.quantity);

        await tx.materialStock.upsert({
          where: { materialId_branchId: { materialId: item.materialId, branchId } },
          create: { clinicId, materialId: item.materialId, branchId, quantity: quantityAfter, updatedByUserId: userId },
          update: { quantity: quantityAfter, updatedByUserId: userId },
        });

        await tx.stockMovement.create({
          data: {
            clinicId,
            materialId: item.materialId,
            branchId,
            type: 'IN',
            quantity: item.quantity,
            quantityBefore,
            quantityAfter,
            contractorId: contractorId || null,
            sourceType: 'RECEIPT',
            sourceId: rec.id,
            createdByUserId: userId,
          },
        });
      }

      return rec;
    });

    return R.created(res, receipt);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Service Materials (materials used per service)
// ============================================================

export const getServiceMaterials = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const clinicId = req.user!.clinicId;

    const service = await prisma.service.findFirst({ where: { id: serviceId, clinicId, isDeleted: false } });
    if (!service) return R.error(res, 'Service not found', 404);

    const materials = await prisma.serviceMaterial.findMany({
      where: { serviceId },
      include: {
        material: {
          include: { unit: { select: { id: true, name: true, shortName: true } } },
        },
      },
    });

    return R.ok(res, materials);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const upsertServiceMaterial = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const clinicId = req.user!.clinicId;
    const { materialId, quantity, isRequired } = req.body;

    if (!materialId || quantity === undefined) return R.error(res, 'materialId and quantity are required');

    const service = await prisma.service.findFirst({ where: { id: serviceId, clinicId, isDeleted: false } });
    if (!service) return R.error(res, 'Service not found', 404);

    const material = await prisma.material.findFirst({ where: { id: materialId, clinicId } });
    if (!material) return R.error(res, 'Material not found', 404);

    const sm = await prisma.serviceMaterial.upsert({
      where: { serviceId_materialId: { serviceId, materialId } },
      create: { clinicId, serviceId, materialId, quantity, isRequired: isRequired ?? true },
      update: { quantity, isRequired: isRequired ?? undefined },
      include: { material: { include: { unit: { select: { id: true, name: true, shortName: true } } } } },
    });

    return R.ok(res, sm);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteServiceMaterial = async (req: Request, res: Response) => {
  try {
    const { serviceId, materialId } = req.params;
    const clinicId = req.user!.clinicId;

    const service = await prisma.service.findFirst({ where: { id: serviceId, clinicId, isDeleted: false } });
    if (!service) return R.error(res, 'Service not found', 404);

    await prisma.serviceMaterial.delete({
      where: { serviceId_materialId: { serviceId, materialId } },
    });

    return R.ok(res, { serviceId, materialId });
  } catch (err) {
    return R.serverError(res, err);
  }
};
