import { Request, Response } from 'express';
import prisma from '../config/db.js';

// Get available standards
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
        res.json(subjects);
    } catch (error) {
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

export const seedContent = async (req: Request, res: Response) => {
    res.json({ message: 'Use CLI seed script instead.' });
};
