import { Request, Response } from 'express';
import prisma from '../config/db.js';

const NUDGES = [
    "The bird is watching you... take your lesson!",
    "Another day, another chance to not disappoint the bird.",
    "Your streak is crying. Do you want to see a bird cry?",
    "I'm not mad, just disappointed. Open the app.",
    "Studies show that taking a quiz every day makes you 100% more likely to not get poked by a bird.",
    "Is that a streak I see expiring? How... unfortunate.",
    "Remember: The bird never sleeps. Neither should your ambition."
];

export const getNotifications = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.notification.update({
            where: { id: id as string },
            data: { isRead: true }
        });
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error });
    }
};

export const syncNotifications = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { notifications: true, quizSessions: { orderBy: { startTime: 'desc' }, take: 1 } }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = new Date();
        const lastActivity = user.quizSessions[0]?.startTime || user.createdAt;
        const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

        // 1. Daily Reminder (If no session today)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const hasSessionToday = user.quizSessions[0]?.startTime >= startOfToday;

        if (!hasSessionToday) {
            const lastReminder = user.notifications.find(n => n.type === 'REMINDER' && n.createdAt >= startOfToday);
            if (!lastReminder) {
                await prisma.notification.create({
                    data: {
                        userId,
                        title: "Daily Goal",
                        message: "Don't break your streak! Time for a quick science quiz.",
                        type: "REMINDER"
                    }
                });
            }
        }

        // 2. Streak Alert (In danger)
        if (user.streak > 0 && hoursSinceLastActivity > 20 && hoursSinceLastActivity < 24) {
            const recentStreakAlert = user.notifications.find(n => n.type === 'STREAK' && n.createdAt >= startOfToday);
            if (!recentStreakAlert) {
                await prisma.notification.create({
                    data: {
                        userId,
                        title: "Streak in Danger!",
                        message: `Your ${user.streak}-day streak is about to expire. Save it now!`,
                        type: "STREAK"
                    }
                });
            }
        }

        // 3. Persistent Nudges (Aggressive/Funny)
        if (hoursSinceLastActivity > 48) {
            const lastNudge = user.notifications.find(n => n.type === 'NUDGE' && n.createdAt >= startOfToday);
            if (!lastNudge) {
                const randomNudge = NUDGES[Math.floor(Math.random() * NUDGES.length)];
                await prisma.notification.create({
                    data: {
                        userId,
                        title: "Where are you?",
                        message: randomNudge,
                        type: "NUDGE"
                    }
                });
            }
        }

        // Return the fresh list
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error syncing notifications', error });
    }
};
