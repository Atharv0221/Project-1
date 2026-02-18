import { Request, Response } from 'express';
import prisma from '../config/db.js';

// Get global leaderboard
export const getGlobalLeaderboard = async (req: Request, res: Response) => {
    const { limit = 50 } = req.query;

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                xp: true,
                rankScore: true,
                scholarStatus: true,
                streak: true,
            },
            orderBy: {
                rankScore: 'desc'
            },
            take: Number(limit)
        });

        // Add rank position
        const leaderboard = users.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching leaderboard', error });
    }
};

// Get standard-wise leaderboard
export const getStandardLeaderboard = async (req: Request, res: Response) => {
    const { standard } = req.params;
    const { limit = 50 } = req.query;

    try {
        // Get users who have completed quizzes in this standard
        const users = await prisma.user.findMany({
            where: {
                quizSessions: {
                    some: {
                        level: {
                            chapter: {
                                subject: {
                                    standard: String(standard)
                                }
                            }
                        },
                        status: 'COMPLETED'
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                xp: true,
                rankScore: true,
                scholarStatus: true,
                streak: true,
            },
            orderBy: {
                rankScore: 'desc'
            },
            take: Number(limit)
        });

        const leaderboard = users.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching standard leaderboard', error });
    }
};

// Get subject-wise leaderboard
export const getSubjectLeaderboard = async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    const { limit = 50 } = req.query;

    try {
        // Get users who have completed quizzes in this subject
        const users = await prisma.user.findMany({
            where: {
                quizSessions: {
                    some: {
                        level: {
                            chapter: {
                                subjectId: String(subjectId)
                            }
                        },
                        status: 'COMPLETED'
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                xp: true,
                rankScore: true,
                scholarStatus: true,
                streak: true,
            },
            orderBy: {
                rankScore: 'desc'
            },
            take: Number(limit)
        });

        const leaderboard = users.map((user, index) => ({
            ...user,
            rank: index + 1
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching subject leaderboard', error });
    }
};

// Get user's rank position
export const getUserRank = async (req: Request, res: Response) => {
    const userId = req.params.userId as string;

    try {
        // Get all users ordered by rank score
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                rankScore: true,
            },
            orderBy: {
                rankScore: 'desc'
            }
        });

        // Find user's position
        const userIndex = allUsers.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                xp: true,
                rankScore: true,
                scholarStatus: true,
                streak: true,
            }
        });

        res.json({
            ...user,
            rank: userIndex + 1,
            totalUsers: allUsers.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user rank', error });
    }
};
