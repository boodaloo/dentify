import { Router } from 'express';
import {
  getBranches, getBranchById, createBranch, updateBranch, deleteBranch,
  upsertWorkingHours,
  getRooms, createRoom, updateRoom,
} from '../controllers/branchController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(auth);

router.get('/',    getBranches);
router.post('/',   requireRole('OWNER', 'ADMIN'), createBranch);
router.get('/:id', getBranchById);
router.put('/:id', requireRole('OWNER', 'ADMIN'), updateBranch);
router.delete('/:id', requireRole('OWNER'), deleteBranch);

// Working hours
router.put('/:id/working-hours', requireRole('OWNER', 'ADMIN'), upsertWorkingHours);

// Rooms
router.get('/:id/rooms',         getRooms);
router.post('/:id/rooms',        requireRole('OWNER', 'ADMIN'), createRoom);
router.put('/:id/rooms/:roomId', requireRole('OWNER', 'ADMIN'), updateRoom);

export default router;
