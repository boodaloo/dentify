import { Router } from 'express';
import {
  getUnits, createUnit, updateUnit,
  getMaterialCategories, createMaterialCategory, updateMaterialCategory,
  getContractors, createContractor, updateContractor,
  getMaterials, getMaterialById, createMaterial, updateMaterial,
  getStock,
  getMovements, createMovement,
  getReceipts, createReceipt,
  getServiceMaterials, upsertServiceMaterial, deleteServiceMaterial,
} from '../controllers/inventoryController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(auth);

// Units
router.get('/units',        getUnits);
router.post('/units',       requireRole('OWNER', 'ADMIN'), createUnit);
router.put('/units/:id',    requireRole('OWNER', 'ADMIN'), updateUnit);

// Material Categories
router.get('/categories',        getMaterialCategories);
router.post('/categories',       requireRole('OWNER', 'ADMIN'), createMaterialCategory);
router.put('/categories/:id',    requireRole('OWNER', 'ADMIN'), updateMaterialCategory);

// Contractors
router.get('/contractors',        getContractors);
router.post('/contractors',       requireRole('OWNER', 'ADMIN'), createContractor);
router.put('/contractors/:id',    requireRole('OWNER', 'ADMIN'), updateContractor);

// Materials
router.get('/materials',         getMaterials);
router.post('/materials',        requireRole('OWNER', 'ADMIN'), createMaterial);
router.get('/materials/:id',     getMaterialById);
router.put('/materials/:id',     requireRole('OWNER', 'ADMIN'), updateMaterial);

// Stock (current quantities)
router.get('/stock', getStock);

// Stock Movements
router.get('/movements',  getMovements);
router.post('/movements', requireRole('OWNER', 'ADMIN', 'NURSE'), createMovement);

// Receipts (incoming from suppliers)
router.get('/receipts',  getReceipts);
router.post('/receipts', requireRole('OWNER', 'ADMIN'), createReceipt);

// Service Materials (materials per service)
router.get('/services/:serviceId/materials',                  getServiceMaterials);
router.put('/services/:serviceId/materials',                  requireRole('OWNER', 'ADMIN'), upsertServiceMaterial);
router.delete('/services/:serviceId/materials/:materialId',   requireRole('OWNER', 'ADMIN'), deleteServiceMaterial);

export default router;
