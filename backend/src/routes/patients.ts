import { Router } from 'express';
import { getPatients, createPatient, getPatientById, updatePatient } from '../controllers/patientController';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth); // Protect all patient routes

router.get('/', getPatients);
router.post('/', createPatient);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);

export default router;
