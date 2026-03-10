import { Router } from 'express';
import {
  getStaff, getStaffById, createStaff, updateStaff, deactivateStaff,
  getSchedule, upsertSchedule,
  getExceptions, createException, deleteException,
  getSpecializations, createSpecialization,
} from '../controllers/staffController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(auth);

// Specializations
router.get('/specializations',  getSpecializations);
router.post('/specializations', requireRole('OWNER', 'ADMIN'), createSpecialization);

// Staff CRUD
router.get('/',    getStaff);
router.post('/',   requireRole('OWNER', 'ADMIN'), createStaff);
router.get('/:id', getStaffById);
router.put('/:id', requireRole('OWNER', 'ADMIN'), updateStaff);
router.delete('/:id', requireRole('OWNER'), deactivateStaff);

// Schedule
router.get('/:id/schedule',  getSchedule);
router.put('/:id/schedule',  requireRole('OWNER', 'ADMIN'), upsertSchedule);

// Schedule exceptions
router.get('/:id/schedule/exceptions',              getExceptions);
router.post('/:id/schedule/exceptions',             requireRole('OWNER', 'ADMIN'), createException);
router.delete('/:id/schedule/exceptions/:exceptionId', requireRole('OWNER', 'ADMIN'), deleteException);

export default router;
