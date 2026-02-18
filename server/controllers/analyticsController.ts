import { Request, Response } from 'express';
import prisma from '../config/db.js';

// Get time spent analytics (subject-wise or chapter-wise if subjectId is provided)
export const getTimeSpentAnalytics = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { subjectId: filterSubjectId } = req.query;

    try {
        const timeData = await prisma.quizSession.findMany({
            where: {
                userId,
                status: 'COMPLETED',
                level: filterSubjectId ? {
                    chapter: {
                        subjectId: filterSubjectId as string
                    }
                } : undefined
            },
            include: {
                level: {
                    include: {
                        chapter: {
                            include: {
                                subject: true
                            }
                        }
                    }
                }
            }
        });

        if (filterSubjectId) {
            // Group by chapter
            const chapterTimeMap: Record<string, { name: string; time: number }> = {};
            timeData.forEach(session => {
                const chapterName = session.level?.chapter?.name || 'Unknown';
                const chapterId = session.level?.chapter?.id || 'unknown';
                if (!chapterTimeMap[chapterId]) {
                    chapterTimeMap[chapterId] = { name: chapterName, time: 0 };
                }
                chapterTimeMap[chapterId].time += session.timeSpent || 0;
            });
            const result = Object.values(chapterTimeMap).map(item => ({
                label: item.name,
                value: Math.round(item.time / 60)
            }));
            return res.json(result);
        }

        // Default: Group by subject
        const subjectTimeMap: Record<string, { name: string; time: number }> = {};
        timeData.forEach(session => {
            const subjectName = session.level?.chapter?.subject?.name || 'Unknown';
            const subjectId = session.level?.chapter?.subject?.id || 'unknown';
            if (!subjectTimeMap[subjectId]) {
                subjectTimeMap[subjectId] = { name: subjectName, time: 0 };
            }
            subjectTimeMap[subjectId].time += session.timeSpent || 0;
        });

        const result = Object.values(subjectTimeMap).map(item => ({
            label: item.name,
            value: Math.round(item.time / 60)
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching time analytics', error });
    }
};

// Get accuracy trend (last 30 days)
export const getAccuracyTrend = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sessions = await prisma.quizSession.findMany({
            where: {
                userId,
                status: 'COMPLETED',
                startTime: {
                    gte: thirtyDaysAgo
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        // Group by date
        const dateMap: Record<string, { total: number; correct: number; count: number }> = {};

        for (const session of sessions) {
            const date = session.startTime.toISOString().split('T')[0];

            if (!dateMap[date]) {
                dateMap[date] = { total: 0, correct: 0, count: 0 };
            }

            const attempts = await prisma.attempt.findMany({
                where: { quizSessionId: session.id }
            });

            const correctCount = attempts.filter(a => a.isCorrect).length;
            dateMap[date].total += attempts.length;
            dateMap[date].correct += correctCount;
            dateMap[date].count += 1;
        }

        const result = Object.entries(dateMap).map(([date, data]) => ({
            date,
            accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching accuracy trend', error });
    }
};

// Get difficulty mastery (filterable by subject or chapter)
export const getDifficultyMastery = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { subjectId, chapterId } = req.query;

    try {
        const attempts = await prisma.attempt.findMany({
            where: {
                userId,
                question: {
                    level: (subjectId || chapterId) ? {
                        chapter: chapterId ? { id: chapterId as string } : { subjectId: subjectId as string }
                    } : undefined
                }
            },
            include: {
                question: true
            }
        });

        const difficultyStats: Record<string, { total: number; correct: number }> = {
            EASY: { total: 0, correct: 0 },
            MEDIUM: { total: 0, correct: 0 },
            HARD: { total: 0, correct: 0 }
        };

        attempts.forEach(attempt => {
            const difficulty = attempt.question?.difficulty || 'EASY';
            if (difficultyStats[difficulty]) {
                difficultyStats[difficulty].total += 1;
                if (attempt.isCorrect) {
                    difficultyStats[difficulty].correct += 1;
                }
            }
        });

        const result = Object.entries(difficultyStats).map(([difficulty, stats]) => ({
            difficulty,
            accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
            count: stats.total
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching difficulty mastery', error });
    }
};

// Get rank progression (last 30 days)
export const getRankProgression = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sessions = await prisma.quizSession.findMany({
            where: {
                userId,
                status: 'COMPLETED',
                startTime: {
                    gte: thirtyDaysAgo
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        // Get user's rank score progression
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { rankScore: true }
        });

        // Calculate cumulative rank score over time
        let cumulativeScore = 0;
        const result = sessions.map(session => {
            const date = session.startTime.toISOString().split('T')[0];
            // Approximate score earned per session (simplified)
            const sessionScore = session.score * 0.5 + 10; // Simplified calculation
            cumulativeScore += sessionScore;

            return {
                date,
                rankScore: Math.round(cumulativeScore)
            };
        });

        // Add current rank score as final point
        if (result.length > 0 && user) {
            result.push({
                date: new Date().toISOString().split('T')[0],
                rankScore: user.rankScore
            });
        }

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching rank progression', error });
    }
};
