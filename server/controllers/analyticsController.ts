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
// Get Zen Zone Revision Data (Weak Topics + Key Questions)
export const getZenRevisionData = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
        // 1. Fetch Top 3 Weak Topics (lowest mastery)
        const weakAreas = await prisma.masteryTracking.findMany({
            where: { userId },
            orderBy: { masteryLevel: 'asc' },
            take: 3,
            include: {
                subtopic: {
                    include: {
                        chapter: {
                            include: { subject: true }
                        }
                    }
                }
            }
        });

        const weakTopics = weakAreas.map(w => ({
            id: w.subtopicId,
            name: w.subtopic.name,
            chapter: w.subtopic.chapter.name,
            subject: w.subtopic.chapter.subject.name,
            mastery: Math.round(w.masteryLevel)
        }));

        // 2. Fetch 5 Important Questions (Hard difficulty from weak chapters)
        const weakChapterIds = weakAreas.map(w => w.subtopic.chapterId);

        const importantQuestions = await prisma.question.findMany({
            where: {
                difficulty: 'HARD',
                level: weakChapterIds.length > 0 ? {
                    chapterId: { in: weakChapterIds }
                } : undefined
            },
            take: 5,
            include: {
                level: {
                    include: { chapter: true }
                }
            }
        });

        const formattedQuestions = importantQuestions.map(q => ({
            id: q.id,
            content: q.content,
            chapter: q.level?.chapter?.name || 'General',
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correctOption: q.correctOption,
            explanation: q.rightFeedback || 'Focus on the core concept.'
        }));

        res.json({
            weakTopics: weakTopics.length > 0 ? weakTopics : [
                { id: '1', name: 'General Review', chapter: 'Basics', subject: 'Science', mastery: 45 },
                { id: '2', name: 'Time Management', chapter: 'Exam Prep', subject: 'Strategy', mastery: 30 }
            ],
            importantQuestions: formattedQuestions.length > 0 ? formattedQuestions : [
                {
                    id: 'm1',
                    content: 'Which Newton’s law explains why we lean forward when a bus stops suddenly?',
                    chapter: 'Laws of Motion',
                    options: [{ id: 1, text: 'First Law' }, { id: 2, text: 'Second Law' }, { id: 3, text: 'Third Law' }, { id: 4, text: 'Law of Gravity' }],
                    correctOption: 1,
                    explanation: 'Newton’s First Law (Inertia) states an object in motion stays in motion.'
                }
            ]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching Zen revision data', error });
    }
};
