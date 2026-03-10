import { Router } from 'express';
import {
  getDiagnosisCategories, getDiagnoses, createDiagnosis,
  getTreatmentPlans, getTreatmentPlanById, createTreatmentPlan, updateTreatmentPlan, deleteTreatmentPlan, markPlanItemDone,
  getMedicalRecords, getMedicalRecordById, createMedicalRecord, updateMedicalRecord, deleteMedicalRecord,
  getDentalChart, upsertToothStatus, getDentalChartHistory,
  getDiaryEntries, createDiaryEntry, updateDiaryEntry,
  getTreatmentPlanTemplates, createTreatmentPlanTemplate,
} from '../controllers/clinicalController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(auth);

// Diagnoses
router.get('/diagnoses/categories', getDiagnosisCategories);
router.get('/diagnoses',            getDiagnoses);
router.post('/diagnoses',           requireRole('OWNER', 'ADMIN', 'DOCTOR'), createDiagnosis);

// Treatment Plans
router.get('/treatment-plans',           getTreatmentPlans);
router.post('/treatment-plans',          requireRole('OWNER', 'ADMIN', 'DOCTOR'), createTreatmentPlan);
router.get('/treatment-plans/templates', getTreatmentPlanTemplates);
router.post('/treatment-plans/templates', requireRole('OWNER', 'ADMIN', 'DOCTOR'), createTreatmentPlanTemplate);
router.get('/treatment-plans/:id',       getTreatmentPlanById);
router.put('/treatment-plans/:id',       requireRole('OWNER', 'ADMIN', 'DOCTOR'), updateTreatmentPlan);
router.delete('/treatment-plans/:id',    requireRole('OWNER', 'ADMIN', 'DOCTOR'), deleteTreatmentPlan);
router.patch('/treatment-plans/:id/items/:itemId/done', requireRole('OWNER', 'ADMIN', 'DOCTOR'), markPlanItemDone);

// Medical Records
router.get('/medical-records',       getMedicalRecords);
router.post('/medical-records',      requireRole('OWNER', 'ADMIN', 'DOCTOR'), createMedicalRecord);
router.get('/medical-records/:id',   getMedicalRecordById);
router.put('/medical-records/:id',   requireRole('OWNER', 'ADMIN', 'DOCTOR'), updateMedicalRecord);
router.delete('/medical-records/:id', requireRole('OWNER', 'ADMIN', 'DOCTOR'), deleteMedicalRecord);

// Dental Chart (per patient)
router.get('/patients/:patientId/dental-chart',                    getDentalChart);
router.put('/patients/:patientId/dental-chart',                    requireRole('OWNER', 'ADMIN', 'DOCTOR'), upsertToothStatus);
router.get('/patients/:patientId/dental-chart/:toothNumber/history', getDentalChartHistory);

// Patient Diary (per patient)
router.get('/patients/:patientId/diary',              getDiaryEntries);
router.post('/patients/:patientId/diary',             requireRole('OWNER', 'ADMIN', 'DOCTOR', 'NURSE'), createDiaryEntry);
router.put('/patients/:patientId/diary/:entryId',     requireRole('OWNER', 'ADMIN', 'DOCTOR', 'NURSE'), updateDiaryEntry);

export default router;
