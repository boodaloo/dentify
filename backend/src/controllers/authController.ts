import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, clinicName } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Clinic
        const clinic = await prisma.clinic.create({
            data: {
                name: clinicName,
                users: {
                    create: {
                        email,
                        password: hashedPassword,
                        name,
                        role: 'ADMIN',
                    },
                },
            },
            include: {
                users: true,
            },
        });

        const user = clinic.users[0];
        const token = generateToken({ id: user.id, email: user.email, role: user.role, clinicId: clinic.id });

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: clinic.id } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken({ id: user.id, email: user.email, role: user.role, clinicId: user.clinicId });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, clinicId: user.clinicId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
