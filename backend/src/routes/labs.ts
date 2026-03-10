import { Router } from 'express';
import {
  getTechnicians, getTechnicianById, createTechnician, updateTechnician, upsertPriceItem,
  getOrders, getOrderById, createOrder, updateOrder, deleteOrder, completeStage,
  getLabInvoices, createLabInvoice, payLabInvoice,
} from '../controllers/labController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(auth);

// Technicians
router.get('/technicians',        getTechnicians);
router.post('/technicians',       requireRole('OWNER', 'ADMIN'), createTechnician);
router.get('/technicians/:id',    getTechnicianById);
router.put('/technicians/:id',    requireRole('OWNER', 'ADMIN'), updateTechnician);
router.post('/technicians/:id/prices', requireRole('OWNER', 'ADMIN'), upsertPriceItem);

// Orders
router.get('/orders',         getOrders);
router.post('/orders',        requireRole('OWNER', 'ADMIN', 'DOCTOR'), createOrder);
router.get('/orders/:id',     getOrderById);
router.put('/orders/:id',     requireRole('OWNER', 'ADMIN', 'DOCTOR'), updateOrder);
router.delete('/orders/:id',  requireRole('OWNER', 'ADMIN'), deleteOrder);
router.patch('/orders/:id/stages/:stageId/complete', requireRole('OWNER', 'ADMIN', 'DOCTOR'), completeStage);

// Invoices (payments to labs)
router.get('/invoices',           getLabInvoices);
router.post('/invoices',          requireRole('OWNER', 'ADMIN', 'ACCOUNTANT'), createLabInvoice);
router.post('/invoices/:id/pay',  requireRole('OWNER', 'ADMIN', 'ACCOUNTANT'), payLabInvoice);

export default router;
