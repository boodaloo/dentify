import { Router } from 'express';
import { getAppointments, createAppointment, updateAppointmentStatus } from '../controllers/appointmentController';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.patch('/:id/status', updateAppointmentStatus);

export default router;
