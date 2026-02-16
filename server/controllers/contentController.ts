import { Request, Response } from 'express';
import prisma from '../config/db.js';

// Get all subjects with hierarchy
export const getSubjects = async (req: Request, res: Response) => {
    try {
        const subjects = await prisma.subject.findMany({
            include: {
                chapters: {
                    include: {
                        subtopics: true,
                    },
                },
            },
        });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Create a new question
export const createQuestion = async (req: Request, res: Response) => {
    const { content, options, correctOption, explanation, difficulty, subtopicId } = req.body;
    try {
        const question = await prisma.question.create({
            data: {
                content,
                options: JSON.stringify(options), // Serialize for SQLite
                correctOption,
                explanation,
                difficulty,
                subtopicId,
            },
        });
        // Return parsed options
        res.status(201).json({ ...question, options: JSON.parse(question.options) });
    } catch (error) {
        res.status(500).json({ message: 'Error creating question', error });
    }
};

// Get questions by subtopic
export const getQuestionsBySubtopic = async (req: Request, res: Response) => {
    const { subtopicId } = req.params;
    try {
        const questions = await prisma.question.findMany({
            where: { subtopicId },
        });

        // Parse JSON options for each question
        const parsedQuestions = questions.map(q => ({
            ...q,
            options: JSON.parse(q.options)
        }));

        res.json(parsedQuestions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error });
    }
};

// Initialize some dummy data (for dev purposes)
export const seedContent = async (req: Request, res: Response) => {
    try {
        // Check if data exists
        const existing = await prisma.subject.findFirst();
        if (existing) return res.json({ message: 'Content already seeded' });

        const subject = await prisma.subject.create({
            data: {
                name: 'Mathematics',
                chapters: {
                    create: [
                        {
                            name: 'Algebra',
                            subtopics: {
                                create: [
                                    { name: 'Linear Equations' },
                                    { name: 'Quadratic Equations' },
                                ],
                            },
                        },
                    ],
                },
            },
        });

        res.json({ message: 'Content seeded', subject });
    } catch (error) {
        res.status(500).json({ message: 'Seeding failed', error });
    }
};
