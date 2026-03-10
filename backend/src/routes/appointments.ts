import { Router } from 'express';
import { getAppointments, getAppointmentById, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointmentController';
import { auth } from '../middleware/auth';

const router = Router();
router.use(auth);

router.get('/',     getAppointments);
router.post('/',    createAppointment);
router.get('/:id',  getAppointmentById);
router.put('/:id',  updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
