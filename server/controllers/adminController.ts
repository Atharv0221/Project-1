import { Request, Response } from 'express';
import prisma from '../config/db.js';

export const getSystemStats = async (req: Request, res: Response) => {
    try {
        const [userCount, postCount, questionCount, attemptCount] = await Promise.all([
            prisma.user.count(),
            prisma.forumPost.count(),
            prisma.question.count(),
            prisma.attempt.count(),
        ]);

        res.json({
            users: userCount,
            posts: postCount,
            questions: questionCount,
            attempts: attemptCount,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching admin stats', error });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isPro: true,
                createdAt: true,
                lastLogin: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['STUDENT', 'ADMIN'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: id as string },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        res.json({ message: 'User role updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Error updating user role', error });
    }
};
