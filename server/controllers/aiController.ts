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
            select: { classStandard: true, name: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // AI Logic continues below (Limits removed for everyone)

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

        // PERSISTENCE LOGIC
        // 1. Find or create the latest conversation for this user
        let conversation = await prisma.conversation.findFirst({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    userId,
                    title: message.substring(0, 30) + (message.length > 30 ? '...' : '')
                }
            });
        }

        // 2. Save User Message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'user',
                content: message
            }
        });

        // 3. Save Assistant Message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: response
            }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() }
        });

        // Log the usage
        await prisma.analyticsLog.create({
            data: {
                userId,
                action: 'CHAT_WITH_MENTOR',
                metadata: JSON.stringify({ messageLength: message.length, conversationId: conversation.id })
            }
        });

        res.json({
            success: true,
            response,
            conversationId: conversation.id,
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

export const getChatHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const conversations = await prisma.conversation.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: { messages: true }
                }
            }
        });

        res.json({ success: true, conversations });
    } catch (error: any) {
        console.error('Get chat history error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
    }
};

export const getConversationMessages = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const conversation = await prisma.conversation.findUnique({
            where: { id, userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.json({ success: true, messages: conversation.messages });
    } catch (error: any) {
        console.error('Get conversation messages error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
};

export const clearChatHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        await prisma.conversation.deleteMany({
            where: { userId }
        });

        res.json({ success: true, message: 'Chat history cleared' });
    } catch (error: any) {
        console.error('Clear chat error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear chat history' });
    }
};
