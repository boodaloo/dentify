import { Router } from 'express';
import {
  getPatientBalance, getBalanceTransactions, depositBalance,
  getPatientBonuses, getBonusTransactions, adjustBonuses,
  getBonusRules, createBonusRule, updateBonusRule,
  getLoyaltyTiers, createLoyaltyTier, updateLoyaltyTier,
  getPromotions, createPromotion, updatePromotion,
  getCashFlowCategories, createCashFlowCategory,
  getCashFlowTransactions, createCashFlowTransaction,
} from '../controllers/financeController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(auth);

// Patient Balance (deposit account)
router.get('/balance/:patientId',              getPatientBalance);
router.get('/balance/:patientId/transactions', getBalanceTransactions);
router.post('/balance/:patientId/deposit',     requireRole('OWNER', 'ADMIN', 'RECEPTIONIST', 'ACCOUNTANT'), depositBalance);

// Bonuses
router.get('/bonuses/:patientId',              getPatientBonuses);
router.get('/bonuses/:patientId/transactions', getBonusTransactions);
router.post('/bonuses/:patientId/adjust',      requireRole('OWNER', 'ADMIN', 'ACCOUNTANT'), adjustBonuses);

// Bonus Rules
router.get('/bonus-rules',       getBonusRules);
router.post('/bonus-rules',      requireRole('OWNER', 'ADMIN'), createBonusRule);
router.put('/bonus-rules/:id',   requireRole('OWNER', 'ADMIN'), updateBonusRule);

// Loyalty Tiers
router.get('/loyalty-tiers',       getLoyaltyTiers);
router.post('/loyalty-tiers',      requireRole('OWNER', 'ADMIN'), createLoyaltyTier);
router.put('/loyalty-tiers/:id',   requireRole('OWNER', 'ADMIN'), updateLoyaltyTier);

// Promotions
router.get('/promotions',       getPromotions);
router.post('/promotions',      requireRole('OWNER', 'ADMIN'), createPromotion);
router.put('/promotions/:id',   requireRole('OWNER', 'ADMIN'), updatePromotion);

// Cash Flow
router.get('/cashflow/categories',       getCashFlowCategories);
router.post('/cashflow/categories',      requireRole('OWNER', 'ADMIN'), createCashFlowCategory);
router.get('/cashflow/transactions',     getCashFlowTransactions);
router.post('/cashflow/transactions',    requireRole('OWNER', 'ADMIN', 'ACCOUNTANT'), createCashFlowTransaction);

export default router;
