import { Router } from 'express';
import {
  getInvoices, getInvoiceById, createInvoice, updateInvoice, cancelInvoice,
  createPayment, getPayments,
} from '../controllers/invoiceController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(auth);

router.get('/',     getInvoices);
router.post('/',    createInvoice);
router.get('/:id',  getInvoiceById);
router.put('/:id',  updateInvoice);
router.post('/:id/cancel', requireRole('OWNER', 'ADMIN', 'RECEPTIONIST'), cancelInvoice);

// Payments
router.get('/:id/payments',  getPayments);
router.post('/:id/payments', createPayment);

export default router;
