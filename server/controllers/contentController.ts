import { Request, Response } from 'express';
import prisma from '../config/db.js';

export const getStandards = async (req: Request, res: Response) => {
    // Hardcoded logic for now as per requirements
    const standards = [
        { id: '8', name: 'Standard 8', locked: false },
        { id: '9', name: 'Standard 9', locked: true },
        { id: '10', name: 'Standard 10', locked: true }
    ];
    res.json(standards);
};

// Get subjects by standard
export const getSubjects = async (req: Request, res: Response) => {
    const { standard } = req.query;
    const userId = (req as any).user?.userId;

    try {
        const whereClause = standard ? { standard: String(standard) } : {};
        const subjects = await prisma.subject.findMany({
            where: whereClause,
            include: {
                chapters: {
                    include: {
                        subtopics: true,
                        levels: {
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                },
                _count: {
                    select: { chapters: true }
                }
            }
        });

        // Add lock status if userId is available (authenticated)
        if (userId) {
            for (const subject of subjects) {
                for (const chapter of subject.chapters) {
                    const levels = chapter.levels;
                    let prevLevelPassed = true;

                    for (let i = 0; i < levels.length; i++) {
                        const level = levels[i] as any;
                        if (level.name === 'Diagnostic') {
                            level.isLocked = false;
                        } else {
                            level.isLocked = !prevLevelPassed;
                        }

                        // Check if current level is passed to unlock next
                        const bestAttempt = await prisma.quizSession.findFirst({
                            where: {
                                userId,
                                levelId: level.id,
                                status: 'COMPLETED'
                            },
                            orderBy: { score: 'desc' }
                        });

                        const requiredScore = level.name === 'Diagnostic' ? 80 : 60;
                        prevLevelPassed = bestAttempt ? bestAttempt.score >= requiredScore : false;
                    }
                }
            }
        }

        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get chapters for a subject with levels
export const getChapters = async (req: Request, res: Response) => {
    const { subjectId } = req.params;
    try {
        const chapters = await prisma.chapter.findMany({
            where: { subjectId: String(subjectId) },
            include: {
                levels: {
                    orderBy: { order: 'asc' }
                },
                subtopics: true // Keep for reference if needed
            }
        });
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get question by level (for new quiz engine) or subtopic
// If levelId is provided, logic to fetch questions based on distribution
export const getQuizQuestions = async (req: Request, res: Response) => {
    const { levelId, subtopicId } = req.query;

    try {
        let questions: any[] = [];

        if (levelId) {
            // New logic: Fetch questions directly from Level
            const level = await prisma.level.findUnique({
                where: { id: String(levelId) },
                include: { questions: true } // Questions are now directly linked to Level in seed
            });

            if (!level) return res.status(404).json({ message: 'Level not found' });

            const allQuestions = level.questions;

            // Filter by difficulty
            const easy = allQuestions.filter(q => q.difficulty === 'EASY');
            const medium = allQuestions.filter(q => q.difficulty === 'MEDIUM');
            const hard = allQuestions.filter(q => q.difficulty === 'HARD');

            // Pick random (simple shuffle)
            const pick = (arr: any[], count: number) => arr.sort(() => 0.5 - Math.random()).slice(0, count);

            questions = [
                ...pick(easy, 5),
                ...pick(medium, 3),
                ...pick(hard, 2)
            ];

            // If not enough questions, just fill with whatever we have to reach 10 if possible
            if (questions.length < 10) {
                const remaining = allQuestions.filter(q => !questions.some(sel => sel.id === q.id));
                const needed = 10 - questions.length;
                questions = [...questions, ...pick(remaining, needed)];
            }

            // Shuffle the final set of questions so difficulties are mixed
            questions.sort(() => 0.5 - Math.random());

        } else if (subtopicId) {
            questions = await prisma.question.findMany({
                where: { subtopicId: String(subtopicId) }
            });
        }

        const parsedQuestions = questions.map((q: any) => {
            let options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
            // Shuffle options
            if (Array.isArray(options)) {
                options.sort(() => 0.5 - Math.random());
            }

            // Return sanitized question (NO correctOption, NO feedback)
            return {
                id: q.id,
                content: q.content,
                options: options,
                difficulty: q.difficulty,
                // explanation/feedback hidden
            };
        });

        res.json(parsedQuestions);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching questions', error });
    }
};

// Legacy/Direct get questions by subtopic
export const getQuestionsBySubtopic = async (req: Request, res: Response) => {
    // Reusing getQuizQuestions logic or keeping simple
    return getQuizQuestions(req, res);
};

export const createQuestion = async (req: Request, res: Response) => {
    const { content, options, correctOption, explanation, difficulty, subtopicId } = req.body;
    try {
        const question = await prisma.question.create({
            data: {
                content,
                options: JSON.stringify(options),
                correctOption,
                explanation,
                difficulty,
                subtopicId,
            },
        });
        res.status(201).json({ ...question, options: JSON.parse(question.options) });
    } catch (error) {
        res.status(500).json({ message: 'Error creating question', error });
    }
};

export const getAdaptiveQuestion = async (req: Request, res: Response) => {
    const { difficulty, chapterId, sessionId } = req.query;

    try {
        let question;

        if (difficulty === 'CHALLENGE') {
            // Find the Challenge level for this chapter
            const challengeLevel = await prisma.level.findFirst({
                where: { chapterId: String(chapterId), name: 'Challenge' },
                include: { questions: true }
            });

            if (challengeLevel && challengeLevel.questions.length > 0) {
                // Filter out already attempted questions
                const attemptedIds = (await prisma.attempt.findMany({
                    where: { quizSessionId: String(sessionId) },
                    select: { questionId: true }
                })).map(a => a.questionId);

                const available = challengeLevel.questions.filter(q => !attemptedIds.includes(q.id));
                question = available[Math.floor(Math.random() * available.length)] || challengeLevel.questions[0];
            }
        } else {
            // Standard difficulty pull (e.g. EASY for downgrade)
            const available = await prisma.question.findMany({
                where: {
                    difficulty: String(difficulty),
                    level: { chapterId: String(chapterId) }
                }
            });

            if (available.length > 0) {
                question = available[Math.floor(Math.random() * available.length)];
            }
        }

        if (!question) return res.status(404).json({ message: 'No suitable adaptive question found' });

        // Sanitize
        res.json({
            id: question.id,
            content: question.content,
            options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options,
            difficulty: question.difficulty
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching adaptive question', error });
    }
};

export const seedContent = async (req: Request, res: Response) => {
    res.json({ message: 'Use CLI seed script instead.' });
};
