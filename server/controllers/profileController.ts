import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get User Profile
export const getProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                gender: true,
                age: true,
                classStandard: true,
                schoolName: true,
                board: true,
                profilePhoto: true,
                streak: true,
                xp: true,
                scholarStatus: true,
                rankScore: true,
                badges: { include: { badge: true } }
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// Update Profile
export const updateProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { name, gender, age, schoolName, board, classStandard } = req.body;

    try {
        // Transactional update if needed, but simple update is fine for single table
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                gender,
                age: age ? parseInt(age) : undefined,
                schoolName,
                board,
                classStandard
            }
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};
