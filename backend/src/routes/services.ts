import { Router } from 'express';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getServices, getServiceById, createService, updateService, deleteService,
  getBranchPrices, upsertBranchPrice, deleteBranchPrice,
} from '../controllers/serviceController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(auth);

// Categories
router.get('/categories',     getCategories);
router.post('/categories',    requireRole('OWNER', 'ADMIN'), createCategory);
router.put('/categories/:id', requireRole('OWNER', 'ADMIN'), updateCategory);
router.delete('/categories/:id', requireRole('OWNER', 'ADMIN'), deleteCategory);

// Services
router.get('/',     getServices);
router.post('/',    requireRole('OWNER', 'ADMIN'), createService);
router.get('/:id',  getServiceById);
router.put('/:id',  requireRole('OWNER', 'ADMIN'), updateService);
router.delete('/:id', requireRole('OWNER', 'ADMIN'), deleteService);

// Branch prices
router.get('/:id/branch-prices',           getBranchPrices);
router.put('/:id/branch-prices',           requireRole('OWNER', 'ADMIN'), upsertBranchPrice);
router.delete('/:id/branch-prices/:branchId', requireRole('OWNER', 'ADMIN'), deleteBranchPrice);

export default router;
