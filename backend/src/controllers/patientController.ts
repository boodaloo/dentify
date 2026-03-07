import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getPatients = async (req: AuthRequest, res: Response) => {
    try {
        const clinicId = req.user?.clinicId;
        const patients = await prisma.patient.findMany({
            where: { clinicId },
            orderBy: { lastName: 'asc' },
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients' });
    }
};

export const createPatient = async (req: AuthRequest, res: Response) => {
    try {
        const clinicId = req.user?.clinicId;
        if (!clinicId) return res.status(400).json({ message: 'Clinic ID not found' });

        const { firstName, lastName, middleName, email, phone, dob, gender } = req.body;

        const patient = await prisma.patient.create({
            data: {
                firstName,
                lastName,
                middleName,
                email,
                phone,
                dob: dob ? new Date(dob) : null,
                gender,
                clinicId,
            },
        });

        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error creating patient' });
    }
};

export const getPatientById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const clinicId = req.user?.clinicId;

        const patient = await prisma.patient.findFirst({
            where: { id, clinicId },
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient' });
    }
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const clinicId = req.user?.clinicId;
        const { firstName, lastName, middleName, email, phone, dob, gender } = req.body;

        const patient = await prisma.patient.findFirst({
            where: { id, clinicId },
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const updatedPatient = await prisma.patient.update({
            where: { id },
            data: {
                firstName,
                lastName,
                middleName,
                email,
                phone,
                dob: dob ? new Date(dob) : null,
                gender,
            },
        });

        res.json(updatedPatient);
    } catch (error) {
        res.status(500).json({ message: 'Error updating patient' });
    }
};
