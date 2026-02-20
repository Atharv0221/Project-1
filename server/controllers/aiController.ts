import { Request, Response } from 'express';
import { generateMentorResponse, generateDailyPlan, generateRemediation } from '../services/aiMentorService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const chatWithMentor = async (req: Request, res: Response) => {
    try {
        const { message, userContext } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Fetch User and Pro status
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { classStandard: true, name: true, isPro: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // --- PRO LIMIT CHECK ---
        const isAdmin = user.role === 'ADMIN';
        if (!user.isPro && !isAdmin) {
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

            const chatCount = await prisma.analyticsLog.count({
                where: {
                    userId,
                    action: 'CHAT_WITH_MENTOR',
                    createdAt: { gte: twentyFourHoursAgo }
                }
            });

            if (chatCount >= 5) {
                return res.status(403).json({
                    success: false,
                    message: 'Daily free AI limit reached. Upgrade to Pro for unlimited mentoring!',
                    limitReached: true
                });
            }
        }

        // Fetch User Context for Chat
        let enrichedContext: any = {};
        const standard = user.classStandard || '10';

        // Fetch Subjects
        const subjects = await prisma.subject.findMany({
            where: { standard },
            include: { chapters: { select: { name: true } } }
        });

        const availableContent = subjects.map(s => `${s.name} (${s.chapters.length} chapters)`);

        // Fetch Weak Topics
        const weakAreas = await prisma.masteryTracking.findMany({
            where: { userId },
            orderBy: { masteryLevel: 'asc' },
            take: 2,
            include: { subtopic: { include: { chapter: { include: { subject: true } } } } }
        });

        const weakTopics = weakAreas.map(w => `${w.subtopic.chapter.subject.name}: ${w.subtopic.name}`);

        enrichedContext = {
            studentName: user.name,
            standard: standard,
            subjects: availableContent,
            weakTopics: weakTopics
        };

        const response = await generateMentorResponse(message, { ...userContext, ...enrichedContext });

        // Log the usage
        await prisma.analyticsLog.create({
            data: {
                userId,
                action: 'CHAT_WITH_MENTOR',
                metadata: JSON.stringify({ messageLength: message.length })
            }
        });

        res.json({
            success: true,
            response,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get AI response'
        });
    }
};

export const getDailyPlan = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Fetch User details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { classStandard: true, name: true }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const standard = user.classStandard || '10';

        // Fetch Subjects and Chapters for this standard
        const subjects = await prisma.subject.findMany({
            where: { standard },
            include: {
                chapters: {
                    select: { name: true }
                }
            }
        });

        const availableContent = subjects.map(s => ({
            subject: s.name,
            chapters: s.chapters.map(c => c.name)
        }));

        // Fetch Weak Topics (lowest mastery)
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

        const weakTopics = weakAreas.map(w => `${w.subtopic.chapter.subject.name}: ${w.subtopic.name}`);

        const userContext = {
            userId: userId,
            level: standard,
            weakTopics: weakTopics.length > 0 ? weakTopics : ['General Revision'],
            availableContent: availableContent
        };

        const plan = await generateDailyPlan(userContext);

        res.json({
            success: true,
            plan,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Daily plan error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate daily plan'
        });
    }
};

export const getRemediation = async (req: Request, res: Response) => {
    try {
        const { questionId, type } = req.body;

        if (!questionId || !type) {
            return res.status(400).json({ message: 'questionId and type are required' });
        }

        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Parse options if string
        const parsedQuestion = {
            ...question,
            options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options
        };

        const remediation = await generateRemediation(parsedQuestion, type as 'UPGRADE' | 'DOWNGRADE');

        res.json({ success: true, remediation });
    } catch (error: any) {
        console.error('Remediation error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate remediation' });
    }
};
