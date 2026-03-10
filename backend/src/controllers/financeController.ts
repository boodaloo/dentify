import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

// ============================================================
// Patient Balance (deposit/prepayment account)
// ============================================================

export const getPatientBalance = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const clinicId = req.user!.clinicId;

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const balance = await prisma.balance.findUnique({ where: { patientId } });
    return R.ok(res, balance ?? { patientId, cashBalance: 0, cardBalance: 0 });
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getBalanceTransactions = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const clinicId = req.user!.clinicId;
    const { page, limit, skip } = getPagination(req);

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const [transactions, total] = await Promise.all([
      prisma.balanceTransaction.findMany({
        where: { patientId, clinicId },
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.balanceTransaction.count({ where: { patientId, clinicId } }),
    ]);

    return R.paginated(res, transactions, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const depositBalance = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { cashAmount, cardAmount, description, receiptNumber } = req.body;

    const cash = Number(cashAmount ?? 0);
    const card = Number(cardAmount ?? 0);
    if (cash + card <= 0) return R.error(res, 'At least one of cashAmount or cardAmount must be positive');

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const result = await prisma.$transaction(async (tx) => {
      const balance = await tx.balance.upsert({
        where: { patientId },
        create: { clinicId, patientId, cashBalance: cash, cardBalance: card },
        update: { cashBalance: { increment: cash }, cardBalance: { increment: card } },
      });

      const txn = await tx.balanceTransaction.create({
        data: {
          clinicId,
          patientId,
          type: 'DEPOSIT',
          amount: cash + card,
          cashAmount: cash,
          cardAmount: card,
          balanceCashAfter: balance.cashBalance,
          balanceCardAfter: balance.cardBalance,
          description: description || null,
          receiptNumber: receiptNumber || null,
          createdByUserId: userId,
        },
      });

      return { balance, transaction: txn };
    });

    return R.created(res, result);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Bonuses
// ============================================================

export const getPatientBonuses = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const clinicId = req.user!.clinicId;

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const bonuses = await prisma.bonus.findUnique({ where: { patientId } });
    return R.ok(res, bonuses ?? { patientId, balance: 0, totalEarned: 0, totalSpent: 0 });
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getBonusTransactions = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const clinicId = req.user!.clinicId;
    const { page, limit, skip } = getPagination(req);

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const [transactions, total] = await Promise.all([
      prisma.bonusTransaction.findMany({
        where: { patientId, clinicId },
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bonusTransaction.count({ where: { patientId, clinicId } }),
    ]);

    return R.paginated(res, transactions, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const adjustBonuses = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { amount, type, description } = req.body;

    if (amount === undefined || !type) return R.error(res, 'amount and type are required');
    const amt = Number(amount);

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.bonus.findUnique({ where: { patientId } });
      const currentBalance = existing?.balance ?? 0;

      if ((type === 'SPENT' || type === 'EXPIRED') && currentBalance < amt) {
        throw new Error('Insufficient bonus balance');
      }

      const newBalance = type === 'EARNED' || type === 'MANUAL'
        ? currentBalance + amt
        : currentBalance - amt;

      const bonus = await tx.bonus.upsert({
        where: { patientId },
        create: {
          clinicId, patientId, balance: newBalance,
          totalEarned: type === 'EARNED' ? amt : 0,
          totalSpent: type === 'SPENT' ? amt : 0,
        },
        update: {
          balance: newBalance,
          totalEarned: type === 'EARNED' ? { increment: amt } : undefined,
          totalSpent: type === 'SPENT' ? { increment: amt } : undefined,
        },
      });

      const txn = await tx.bonusTransaction.create({
        data: {
          clinicId,
          patientId,
          amount: amt,
          balanceAfter: newBalance,
          type,
          description: description || null,
          createdByUserId: userId,
        },
      });

      return { bonus, transaction: txn };
    });

    return R.created(res, result);
  } catch (err: any) {
    if (err.message === 'Insufficient bonus balance') return R.error(res, err.message);
    return R.serverError(res, err);
  }
};

// ============================================================
// Bonus Rules
// ============================================================

export const getBonusRules = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const rules = await prisma.bonusRule.findMany({
      where: { clinicId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    return R.ok(res, rules);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createBonusRule = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, type, value, minCheckAmount } = req.body;
    if (!name || !type || value === undefined) return R.error(res, 'name, type, and value are required');

    const rule = await prisma.bonusRule.create({
      data: { clinicId, name, type, value, minCheckAmount: minCheckAmount || null },
    });
    return R.created(res, rule);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateBonusRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { name, type, value, minCheckAmount, isActive } = req.body;

    const existing = await prisma.bonusRule.findFirst({ where: { id, clinicId } });
    if (!existing) return R.error(res, 'Bonus rule not found', 404);

    const rule = await prisma.bonusRule.update({
      where: { id },
      data: { name: name ?? undefined, type: type ?? undefined, value: value ?? undefined, minCheckAmount: minCheckAmount ?? undefined, isActive: isActive ?? undefined },
    });
    return R.ok(res, rule);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Loyalty Tiers
// ============================================================

export const getLoyaltyTiers = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const tiers = await prisma.loyaltyTier.findMany({
      where: { clinicId, isActive: true },
      include: { _count: { select: { patients: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return R.ok(res, tiers);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createLoyaltyTier = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, minTotalSpent, bonusMultiplier, discountType, discountValue, color, sortOrder } = req.body;
    if (!name || minTotalSpent === undefined) return R.error(res, 'name and minTotalSpent are required');

    const tier = await prisma.loyaltyTier.create({
      data: {
        clinicId, name, minTotalSpent,
        bonusMultiplier: bonusMultiplier ?? 1.0,
        discountType: discountType ?? 'PERCENT',
        discountValue: discountValue ?? 0,
        color: color || null,
        sortOrder: sortOrder ?? 0,
      },
    });
    return R.created(res, tier);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateLoyaltyTier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { name, minTotalSpent, bonusMultiplier, discountType, discountValue, color, sortOrder, isActive } = req.body;

    const existing = await prisma.loyaltyTier.findFirst({ where: { id, clinicId } });
    if (!existing) return R.error(res, 'Loyalty tier not found', 404);

    const tier = await prisma.loyaltyTier.update({
      where: { id },
      data: { name: name ?? undefined, minTotalSpent: minTotalSpent ?? undefined, bonusMultiplier: bonusMultiplier ?? undefined, discountType: discountType ?? undefined, discountValue: discountValue ?? undefined, color: color ?? undefined, sortOrder: sortOrder ?? undefined, isActive: isActive ?? undefined },
    });
    return R.ok(res, tier);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Promotions
// ============================================================

export const getPromotions = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { isActive } = req.query;
    const where: any = { clinicId };
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const promotions = await prisma.promotion.findMany({
      where,
      include: {
        promotionServices: { include: { service: { select: { id: true, name: true } } } },
        _count: { select: { promotionUsages: true } },
      },
      orderBy: { startDate: 'desc' },
    });
    return R.ok(res, promotions);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, description, type, value, startDate, endDate, minCheckAmount, maxUsesTotal, maxUsesPerPatient, promoCode, serviceIds } = req.body;

    if (!name || !type || value === undefined || !startDate || !endDate) {
      return R.error(res, 'name, type, value, startDate, and endDate are required');
    }

    const promotion = await prisma.promotion.create({
      data: {
        clinicId,
        name,
        description: description || null,
        type,
        value,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        minCheckAmount: minCheckAmount || null,
        maxUsesTotal: maxUsesTotal || null,
        maxUsesPerPatient: maxUsesPerPatient || null,
        promoCode: promoCode || null,
        promotionServices: serviceIds && Array.isArray(serviceIds) ? {
          create: serviceIds.map((serviceId: string) => ({ serviceId })),
        } : undefined,
      },
      include: {
        promotionServices: { include: { service: { select: { id: true, name: true } } } },
      },
    });
    return R.created(res, promotion);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { name, description, isActive, startDate, endDate, maxUsesTotal, maxUsesPerPatient } = req.body;

    const existing = await prisma.promotion.findFirst({ where: { id, clinicId } });
    if (!existing) return R.error(res, 'Promotion not found', 404);

    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        name: name ?? undefined,
        description: description ?? undefined,
        isActive: isActive ?? undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        maxUsesTotal: maxUsesTotal ?? undefined,
        maxUsesPerPatient: maxUsesPerPatient ?? undefined,
      },
    });
    return R.ok(res, promotion);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Cash Flow
// ============================================================

export const getCashFlowCategories = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const categories = await prisma.cashFlowCategory.findMany({
      where: { clinicId, isActive: true, parentId: null },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return R.ok(res, categories);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createCashFlowCategory = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, direction, parentId, sortOrder } = req.body;
    if (!name || !direction) return R.error(res, 'name and direction are required');

    const category = await prisma.cashFlowCategory.create({
      data: { clinicId, name, direction, parentId: parentId || null, sortOrder: sortOrder ?? 0 },
    });
    return R.created(res, category);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getCashFlowTransactions = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { branchId, categoryId, direction, from, to } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId };
    if (branchId) where.branchId = branchId;
    if (categoryId) where.categoryId = categoryId;
    if (direction) where.direction = direction;
    if (from || to) {
      where.transactionDate = {};
      if (from) where.transactionDate.gte = new Date(from as string);
      if (to) where.transactionDate.lte = new Date(to as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.cashFlowTransaction.findMany({
        where,
        include: {
          branch: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, direction: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.cashFlowTransaction.count({ where }),
    ]);

    return R.paginated(res, transactions, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createCashFlowTransaction = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { branchId, categoryId, direction, amount, description, transactionDate } = req.body;

    if (!categoryId || !direction || amount === undefined || !transactionDate) {
      return R.error(res, 'categoryId, direction, amount, and transactionDate are required');
    }

    const transaction = await prisma.cashFlowTransaction.create({
      data: {
        clinicId,
        branchId: branchId || null,
        categoryId,
        direction,
        amount,
        description: description || null,
        transactionDate: new Date(transactionDate),
        createdByUserId: userId,
      },
      include: {
        category: { select: { id: true, name: true, direction: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    return R.created(res, transaction);
  } catch (err) {
    return R.serverError(res, err);
  }
};
