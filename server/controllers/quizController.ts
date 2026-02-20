import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { generateQuizFeedback } from '../services/aiMentorService.js';

// Start a quiz session
export const startQuizSession = async (req: Request, res: Response) => {
    const { levelId } = req.body;
    const userId = (req as any).user.userId; // Middleware augments req

    try {
        // --- LEVEL LOCK CHECK ---
        const level = await prisma.level.findUnique({
            where: { id: levelId },
            include: { chapter: true }
        });

        if (!level) return res.status(404).json({ message: 'Level not found' });

        // If it's not Diagnostic, check if prerequisite is met
        if (level.name !== 'Diagnostic') {
            const levels = await prisma.level.findMany({
                where: { chapterId: level.chapterId },
                orderBy: { order: 'asc' }
            });

            const currentLevelIndex = levels.findIndex(l => l.id === levelId);
            if (currentLevelIndex > 0) {
                const prevLevel = levels[currentLevelIndex - 1];
                const bestAttempt = await prisma.quizSession.findFirst({
                    where: {
                        userId,
                        levelId: prevLevel.id,
                        status: 'COMPLETED'
                    },
                    orderBy: { score: 'desc' }
                });

                const requiredScore = prevLevel.name === 'Diagnostic' ? 80 : 60;
                if (!bestAttempt || bestAttempt.score < requiredScore) {
                    return res.status(403).json({
                        message: `Level locked. You need ${requiredScore}% in ${prevLevel.name} to unlock this level.`
                    });
                }
            }
        }

        const session = await prisma.quizSession.create({
            data: {
                userId,
                levelId,
                status: 'IN_PROGRESS',
                startTime: new Date(),
                score: 0,
            }
        });
        res.json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error starting quiz', error });
    }
};

// Submit an answer (record attempt)
export const submitAnswer = async (req: Request, res: Response) => {
    const { sessionId, questionId, selectedOptionId, timeTaken } = req.body;
    const userId = (req as any).user.userId;

    try {
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { level: { include: { chapter: true } } }
        });
        if (!question) return res.status(404).json({ message: 'Question not found' });

        const isCorrect = question.correctOption === selectedOptionId;

        await prisma.attempt.create({
            data: {
                userId,
                quizSessionId: sessionId,
                questionId,
                isCorrect,
                timeTaken,
            }
        });

        // --- ADAPTIVE LOGIC DETECTION ---
        let adaptiveAction: 'UPGRADE' | 'DOWNGRADE' | 'NONE' = 'NONE';

        // Fetch recent attempts in this session
        const recentAttempts = await prisma.attempt.findMany({
            where: { quizSessionId: sessionId },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: { question: true }
        });

        if (isCorrect) {
            // Check for UPGRADE: 3 consecutive correct HARD questions with speed < 25s
            if (recentAttempts.length >= 3) {
                const fastHardCorrect = recentAttempts.every(a =>
                    a.isCorrect &&
                    a.question.difficulty === 'HARD' &&
                    a.timeTaken < 25
                );
                if (fastHardCorrect) adaptiveAction = 'UPGRADE';
            }
        } else {
            // Check for DOWNGRADE: 2 consecutive missed MEDIUM questions
            if (recentAttempts.length >= 2) {
                const missedMedium = recentAttempts.slice(0, 2).every(a =>
                    !a.isCorrect &&
                    a.question.difficulty === 'MEDIUM'
                );
                if (missedMedium) adaptiveAction = 'DOWNGRADE';
            }
        }

        // Return feedback immediately
        const feedback = isCorrect ? question.rightFeedback : question.wrongFeedback;
        res.json({
            isCorrect,
            correctOption: question.correctOption,
            feedback: feedback || (isCorrect ? 'Correct!' : 'Incorrect.'),
            adaptiveAction,
            chapterId: question.level?.chapterId,
            subtopicId: question.subtopicId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting answer', error });
    }
};

// Complete quiz session
export const completeQuizSession = async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    const userId = (req as any).user.userId;

    try {
        const session = await prisma.quizSession.findUnique({
            where: { id: sessionId },
            include: {
                attempts: { include: { question: { include: { subtopic: true } } } },
                level: { include: { chapter: { include: { subject: true } } } }
            }
        });

        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Calculate score
        const totalQuestions = session.attempts.length;
        const correctAnswers = session.attempts.reduce((acc: number, curr: any) => acc + (curr.isCorrect ? 1 : 0), 0);
        const scorePercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        const timeTaken = session.attempts.reduce((acc: number, curr: any) => acc + curr.timeTaken, 0); // Total seconds

        // --- Backend Anti-Cheat Detection ---
        let isFlagged = session.isFlagged || false;
        let flagReason = '';

        // 1. Fast Completion Detection (< 30 seconds for entire quiz)
        if (timeTaken < 30 && totalQuestions >= 10) {
            isFlagged = true;
            flagReason = 'Fast completion detected';
        }

        // 2. Pattern Detection (all answers < 2 seconds each)
        const avgTimePerQuestion = totalQuestions > 0 ? timeTaken / totalQuestions : 0;
        if (avgTimePerQuestion < 2) {
            isFlagged = true;
            flagReason = flagReason ? `${flagReason}; Suspicious answer pattern` : 'Suspicious answer pattern';
        }

        // 3. Tab Switch Tracking (already tracked in frontend)
        if (session.tabSwitches >= 3) {
            isFlagged = true;
            flagReason = flagReason ? `${flagReason}; Excessive tab switching` : 'Excessive tab switching';
        }

        // 4. Perfect Score Pattern (100% on first attempt after multiple failures)
        if (scorePercentage === 100) {
            const previousAttempts = await prisma.quizSession.findMany({
                where: {
                    userId,
                    levelId: session.levelId,
                    status: 'COMPLETED',
                    id: { not: sessionId }
                },
                orderBy: { startTime: 'desc' },
                take: 3
            });

            const recentFailures = previousAttempts.filter(a => a.score < 60).length;
            if (recentFailures >= 2) {
                isFlagged = true;
                flagReason = flagReason ? `${flagReason}; Suspicious score improvement` : 'Suspicious score improvement';
            }
        }

        // --- AI Feedback Generation (ASYNCHRONOUS) ---
        const wrongAnswers = session.attempts.filter(a => !a.isCorrect);

        // Trigger background AI task
        generateQuizFeedback(
            scorePercentage,
            session.level.chapter.subject.name,
            session.level.chapter.name,
            session.level.name,
            wrongAnswers
        ).then(async (aiResponse) => {
            // Update session with AI feedback once ready
            await prisma.quizSession.update({
                where: { id: sessionId },
                data: {
                    aiFeedback: aiResponse.feedback,
                    recommendations: aiResponse.recommendations
                }
            });
            console.log(`AI Feedback generated for session ${sessionId}`);
        }).catch(err => {
            console.error(`AI Feedback generation failed for session ${sessionId}:`, err);
        });

        // Update session immediately with core stats
        const updatedSession = await prisma.quizSession.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED',
                endTime: new Date(),
                score: scorePercentage,
                timeSpent: timeTaken,
                isFlagged,
            }
        });

        // --- Adaptive Logic ---
        let message = 'Quiz completed.';
        let nextLevelUnlock = '';

        if (session.level.name === 'Diagnostic') {
            if (scorePercentage >= 80) {
                message = 'Excellent! You have unlocked Beginner Level.';
                nextLevelUnlock = 'Beginner';
            } else {
                message = 'You need at least 80% to unlock the Beginner Level. Please try again.';
                nextLevelUnlock = '';
            }
        }
        // Logic for other levels (Sequential)
        else if (session.level.name === 'Beginner' && scorePercentage >= 60) nextLevelUnlock = 'Intermediate';
        else if (session.level.name === 'Intermediate' && scorePercentage >= 60) nextLevelUnlock = 'Advance';
        else if (session.level.name === 'Advance' && scorePercentage >= 60) nextLevelUnlock = 'Challenge';


        // --- Gamification Logic ---

        // 1. XP Calculation
        // Formula: Correct * 10
        const baseXp = correctAnswers * 10;

        // 2. Rank Score Calculation
        // Formula: Score * 0.5 + Levels * 10 + Streak * 2 + Speed Bonus
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { quizSessions: true } });
        const levelsCompleted = user?.quizSessions.filter((s: any) => s.status === 'COMPLETED').length || 0;
        const currentStreak = user?.streak || 0;

        // Speed Bonus: If average time per question < 30s, give bonus
        const avgTime = totalQuestions > 0 ? timeTaken / totalQuestions : 0;
        const speedBonus = avgTime < 30 ? 50 : (avgTime < 60 ? 20 : 0);

        const rankScoreIds = (scorePercentage * 0.5) + (levelsCompleted * 10) + (currentStreak * 2) + speedBonus;

        // 3. Update User
        // Scholar Status Logic:
        // Learner: 0-500, Smart: 500-1500, Gold: 1500-3000, Elite: 3000+
        const newXp = (user?.xp || 0) + baseXp;
        let newStatus = 'Learner';
        if (newXp > 3000) newStatus = 'Elite Scholar';
        else if (newXp > 1500) newStatus = 'Gold Scholar';
        else if (newXp > 500) newStatus = 'Smart Scholar';

        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: newXp,
                rankScore: { increment: rankScoreIds }, // Accumulate
                scholarStatus: newStatus,
            }
        });

        // Log XP
        await prisma.xpLog.create({
            data: {
                userId,
                amount: baseXp,
                reason: `Quiz Completion: ${session.level?.name || 'Standard'}`
            }
        });

        res.json({
            message,
            score: scorePercentage,
            xpEarned: baseXp,
            rankScoreEarned: rankScoreIds,
            newStatus,
            nextLevelUnlock,
            // aiFeedback and recommendations are NOT returned yet as they are being generated
            aiFeedbackFetched: false,
            youtubeLink: session.level.chapter.youtubeLink
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error completing quiz', error });
    }
};

// Get specific quiz session details
export const getQuizSessionDetails = async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    try {
        const session = await prisma.quizSession.findUnique({
            where: { id: sessionId as string },
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

        if (!session) return res.status(404).json({ message: 'Session not found' });

        res.json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching session details' });
    }
};

// Get previous quiz reports
export const getQuizReports = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
        const reports = await prisma.quizSession.findMany({
            where: {
                userId,
                status: 'COMPLETED'
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
            },
            orderBy: { endTime: 'desc' },
            take: 10
        });

        res.json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
};
