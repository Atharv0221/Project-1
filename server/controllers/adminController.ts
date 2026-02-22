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

export const addMentorAvailability = async (req: Request, res: Response) => {
    const { mentorId, startTime, endTime } = req.body;

    if (!mentorId || !startTime || !endTime) {
        return res.status(400).json({ message: 'mentorId, startTime, and endTime are required' });
    }

    try {
        const availability = await prisma.mentorAvailability.create({
            data: {
                mentorId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
            }
        });

        res.status(201).json({ message: 'Availability slot added successfully', availability });
    } catch (error) {
        console.error('Error adding mentor availability:', error);
        res.status(500).json({ message: 'Error adding availability', error });
    }
};

export const deleteMentorAvailability = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.mentorAvailability.delete({
            where: { id }
        });

        res.json({ message: 'Availability slot deleted successfully' });
    } catch (error) {
        console.error('Error deleting mentor availability:', error);
        res.status(500).json({ message: 'Error deleting availability', error });
    }
};

export const addSubscriptionHours = async (req: Request, res: Response) => {
    const { userId, hours } = req.body; // In a real app, this would be triggered by a payment success

    if (!userId || hours === undefined) {
        return res.status(400).json({ message: 'userId and hours are required' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                mentoringHoursRemaining: {
                    increment: hours
                }
            }
        });

        res.json({ message: `Successfully added ${hours} hours to user ${updatedUser.name}`, hoursRemaining: updatedUser.mentoringHoursRemaining });
    } catch (error) {
        console.error('Error adding subscription hours:', error);
        res.status(500).json({ message: 'Error updating subscription', error });
    }
};
