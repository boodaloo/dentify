import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getPatients = async (req: AuthRequest, res: Response) => {
    try {
        const clinicId = req.user?.clinicId;
        const { search, page = '1', limit = '10' } = req.query;

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: any = { clinicId, isDeleted: false };
        if (search) {
            where.OR = [
                { firstName: { contains: search as string, mode: 'insensitive' } },
                { lastName: { contains: search as string, mode: 'insensitive' } },
                { middleName: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [patients, total] = await Promise.all([
            prisma.patient.findMany({
                where,
                include: {
                    contacts: { where: { isPrimary: true } },
                    appointments: {
                        where: { isDeleted: false },
                        orderBy: { startTime: 'desc' },
                        take: 1,
                    },
                },
                orderBy: { lastName: 'asc' },
                skip,
                take: parseInt(limit as string),
            }),
            prisma.patient.count({ where }),
        ]);

        // Flatten contacts into familiar phone/email fields for frontend compatibility
        const result = patients.map(p => {
            const phone = p.contacts.find(c => c.type === 'PHONE')?.value || null;
            const email = p.contacts.find(c => c.type === 'EMAIL')?.value || null;
            const lastVisit = p.appointments[0]?.startTime || null;
            return { ...p, phone, email, lastVisit, dateOfBirth: p.birthDate };
        });

        res.json({ items: result, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching patients' });
    }
};

export const createPatient = async (req: AuthRequest, res: Response) => {
    try {
        const clinicId = req.user?.clinicId;
        if (!clinicId) return res.status(400).json({ message: 'Clinic ID not found' });

        const { firstName, lastName, middleName, email, phone, dob, gender, allergies, notes } = req.body;

        const patient = await prisma.patient.create({
            data: {
                firstName,
                lastName,
                middleName: middleName || null,
                birthDate: dob ? new Date(dob) : null,
                gender: gender || null,
                allergies: allergies || null,
                notes: notes || null,
                clinicId,
                contacts: {
                    create: [
                        ...(phone ? [{ type: 'PHONE' as const, value: phone, isPrimary: true, clinicId }] : []),
                        ...(email ? [{ type: 'EMAIL' as const, value: email, isPrimary: true, clinicId }] : []),
                    ],
                },
            },
            include: { contacts: true },
        });

        res.status(201).json(patient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating patient' });
    }
};

export const getPatientById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const clinicId = req.user?.clinicId;

        const patient = await prisma.patient.findFirst({
            where: { id, clinicId, isDeleted: false },
            include: {
                contacts: true,
                doctors: { include: { doctor: true, specialization: true } },
                appointments: {
                    where: { isDeleted: false },
                    orderBy: { startTime: 'desc' },
                    include: { branch: true },
                },
                dentalChart: true,
                invoices: { where: { isDeleted: false } },
            },
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
        const { firstName, lastName, middleName, dob, gender, allergies, notes } = req.body;

        const patient = await prisma.patient.findFirst({ where: { id, clinicId, isDeleted: false } });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const updatedPatient = await prisma.patient.update({
            where: { id },
            data: {
                firstName,
                lastName,
                middleName: middleName || null,
                birthDate: dob ? new Date(dob) : undefined,
                gender: gender || null,
                allergies: allergies || null,
                notes: notes || null,
            },
        });

        res.json(updatedPatient);
    } catch (error) {
        res.status(500).json({ message: 'Error updating patient' });
    }
};
