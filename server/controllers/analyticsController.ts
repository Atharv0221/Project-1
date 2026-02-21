import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini keys (same as aiMentorService)
const geminiApiKeys = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
const genAIs = geminiApiKeys.map(k => new GoogleGenerativeAI(k));

// Ask Gemini to explain the correct answer for a flashcard question
async function aiExplainAnswer(question: string, correctAnswer: string): Promise<string> {
    for (const genAI of genAIs) {
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `You are a helpful tutor for Indian school students (Class 8-10).
Question: "${question}"
Correct Answer: "${correctAnswer}"

Give a clear, concise explanation (2-3 sentences max) of WHY this is the correct answer. Use simple language. No bullet points, just plain text.`;
            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            if (text) return text;
        } catch (e: any) {
            console.warn('Gemini key failed for zen explanation:', e.message);
        }
    }
    return `The correct answer is: ${correctAnswer}`;
}

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
        // ── 1. Compute Weak Chapters from real Attempt data ──────────────────
        // Fetch all attempts by this user with question → level → chapter → subject
        const allAttempts = await prisma.attempt.findMany({
            where: { userId },
            include: {
                question: {
                    include: {
                        level: {
                            include: {
                                chapter: {
                                    include: { subject: true }
                                }
                            }
                        },
                        subtopic: {
                            include: {
                                chapter: {
                                    include: { subject: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Group by chapter, compute mastery = correct / total * 100
        const chapterMap: Record<string, {
            id: string; name: string; subject: string; total: number; correct: number;
        }> = {};

        for (const attempt of allAttempts) {
            const chapter = attempt.question?.level?.chapter || attempt.question?.subtopic?.chapter;
            const subject = attempt.question?.level?.chapter?.subject || attempt.question?.subtopic?.chapter?.subject;
            if (!chapter) continue;

            if (!chapterMap[chapter.id]) {
                chapterMap[chapter.id] = {
                    id: chapter.id,
                    name: chapter.name,
                    subject: subject?.name || 'General',
                    total: 0,
                    correct: 0,
                };
            }
            chapterMap[chapter.id].total += 1;
            if (attempt.isCorrect) chapterMap[chapter.id].correct += 1;
        }

        // Sort by mastery ascending (weakest first), take top 3 with at least 1 attempt
        const sortedChapters = Object.values(chapterMap)
            .filter(c => c.total > 0)
            .map(c => ({
                id: c.id,
                name: c.name,
                chapter: c.name,
                subject: c.subject,
                mastery: Math.round((c.correct / c.total) * 100),
                total: c.total,
            }))
            .sort((a, b) => a.mastery - b.mastery)
            .slice(0, 3);

        const weakTopics = sortedChapters.length > 0 ? sortedChapters : [
            { id: '1', name: 'General Review', chapter: 'Basics', subject: 'Science', mastery: 45, total: 0 },
            { id: '2', name: 'Time Management', chapter: 'Exam Prep', subject: 'Strategy', mastery: 30, total: 0 }
        ];

        // ── 2. Fetch flashcard questions from the student's weak chapters ─────
        const weakChapterIds = sortedChapters.map(c => c.id);

        const importantQuestions = await prisma.question.findMany({
            where: {
                difficulty: 'HARD',
                OR: [
                    weakChapterIds.length > 0 ? { level: { chapterId: { in: weakChapterIds } } } : {},
                    weakChapterIds.length > 0 ? { subtopic: { chapterId: { in: weakChapterIds } } } : {},
                ]
            },
            take: 5,
            include: {
                level: { include: { chapter: true } },
                subtopic: { include: { chapter: true } }
            }
        });

        // Build questions with AI explanations
        const formattedQuestions = await Promise.all(importantQuestions.map(async q => {
            const opts: any[] = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options as any[]);
            // Find the correct answer text
            const correctOpt = opts.find((o: any) => o.id === q.correctOption || o.id === String(q.correctOption));
            const correctAnswerText = correctOpt?.text || opts[0]?.text || 'See explanation';

            // Use AI to explain — fallback to stored rightFeedback
            let explanation = q.rightFeedback && q.rightFeedback.trim().length > 10
                ? q.rightFeedback
                : await aiExplainAnswer(q.content, correctAnswerText);

            return {
                id: q.id,
                content: q.content,
                chapter: q.level?.chapter?.name || (q as any).subtopic?.chapter?.name || 'General',
                options: opts,
                correctOption: q.correctOption,
                correctAnswerText,
                explanation
            };
        }));

        // If no questions from DB, use high-yield fallback questions with AI explanations
        const fallbackRaw = [
            {
                id: 'f1', content: "Which Newton's law explains why we lean forward when a bus stops suddenly?",
                options: [{ id: 1, text: "First Law" }, { id: 2, text: "Second Law" }, { id: 3, text: "Third Law" }, { id: 4, text: "Law of Gravity" }],
                correctOption: 1, chapter: 'Laws of Motion'
            },
            {
                id: 'f2', content: "What is the SI unit of electric current?",
                options: [{ id: 1, text: "Volt" }, { id: 2, text: "Watt" }, { id: 3, text: "Ampere" }, { id: 4, text: "Ohm" }],
                correctOption: 3, chapter: 'Electricity'
            },
            {
                id: 'f3', content: "Which gas is produced during photosynthesis?",
                options: [{ id: 1, text: "Carbon Dioxide" }, { id: 2, text: "Oxygen" }, { id: 3, text: "Nitrogen" }, { id: 4, text: "Hydrogen" }],
                correctOption: 2, chapter: 'Life Processes'
            },
            {
                id: 'f4', content: "The mirror formula is 1/f = 1/v + 1/u. What does 'f' represent?",
                options: [{ id: 1, text: "Focal length" }, { id: 2, text: "Frequency" }, { id: 3, text: "Force" }, { id: 4, text: "Field" }],
                correctOption: 1, chapter: 'Light'
            },
            {
                id: 'f5', content: "What type of reaction is rusting of iron?",
                options: [{ id: 1, text: "Decomposition" }, { id: 2, text: "Displacement" }, { id: 3, text: "Oxidation" }, { id: 4, text: "Neutralization" }],
                correctOption: 3, chapter: 'Chemical Reactions'
            }
        ];

        const fallbackWithAI = await Promise.all(fallbackRaw.map(async q => {
            const correctOpt = q.options.find(o => o.id === q.correctOption);
            const correctAnswerText = correctOpt?.text || '';
            const explanation = await aiExplainAnswer(q.content, correctAnswerText);
            return { ...q, correctAnswerText, explanation };
        }));

        res.json({
            weakTopics: weakTopics.length > 0 ? weakTopics : [
                { id: '1', name: 'General Review', chapter: 'Basics', subject: 'Science', mastery: 45 },
                { id: '2', name: 'Time Management', chapter: 'Exam Prep', subject: 'Strategy', mastery: 30 }
            ],
            importantQuestions: formattedQuestions.length > 0 ? formattedQuestions : fallbackWithAI
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching Zen revision data', error });
    }
};
