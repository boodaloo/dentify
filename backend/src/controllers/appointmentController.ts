import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getAppointments = async (req: AuthRequest, res: Response) => {
    try {
        const clinicId = req.user?.clinicId;
        const { start, end } = req.query;

        const appointments = await prisma.appointment.findMany({
            where: {
                clinicId,
                isDeleted: false,
                startTime: {
                    gte: start ? new Date(start as string) : undefined,
                    lte: end ? new Date(end as string) : undefined,
                },
            },
            include: {
                patient: {
                    select: { id: true, firstName: true, lastName: true, contacts: { where: { type: 'PHONE', isPrimary: true } } },
                },
                doctor: {
                    select: { id: true, name: true, specialization: true },
                },
                branch: true,
                services: { include: { service: true } },
            },
            orderBy: { startTime: 'asc' },
        });

        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const clinicId = req.user?.clinicId;
        if (!clinicId) return res.status(400).json({ message: 'Clinic ID not found' });

        const { patientId, doctorId, branchId, roomId, startTime, endTime, notes } = req.body;

        const appointment = await prisma.appointment.create({
            data: {
                clinicId,
                patientId,
                doctorId,
                branchId,
                roomId: roomId || null,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                notes: notes || null,
            },
            include: {
                patient: { select: { id: true, firstName: true, lastName: true } },
                doctor: { select: { id: true, name: true } },
                branch: true,
            },
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating appointment' });
    }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const clinicId = req.user?.clinicId;

        const appointment = await prisma.appointment.findFirst({ where: { id, clinicId, isDeleted: false } });
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        const updated = await prisma.appointment.update({
            where: { id },
            data: { status },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating appointment' });
    }
};
