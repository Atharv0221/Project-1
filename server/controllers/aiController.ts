import { Request, Response } from 'express';
import { generateMentorResponse, generateDailyPlan } from '../services/aiMentorService.js';

export const chatWithMentor = async (req: Request, res: Response) => {
    try {
        const { message, userContext } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const response = await generateMentorResponse(message, userContext);

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
        // In a real app, fetch this from user's actual data
        const userContext = {
            weakTopics: ['Organic Chemistry', 'Calculus'],
            recentSubjects: ['Mathematics', 'Chemistry'],
            level: 14
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
