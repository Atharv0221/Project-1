import { Request, Response } from 'express';
import prisma from '../config/db.js';

// Get User Profile
export const getProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                gender: true,
                age: true,
                classStandard: true,
                schoolName: true,
                board: true,
                profilePhoto: true,
                streak: true,
                xp: true,
                scholarStatus: true,
                rankScore: true,
                isPro: true,
                subscriptionExpiry: true,
                badges: { include: { badge: true } }
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// Upgrade User to Pro
export const upgradeToPro = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 days subscription

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                isPro: true,
                subscriptionExpiry: expiryDate
            }
        });

        res.json({
            message: 'Successfully upgraded to Pro Plan!',
            isPro: true,
            subscriptionExpiry: expiryDate
        });
    } catch (error) {
        console.error('Upgrade to Pro Error:', error);
        res.status(500).json({ message: 'Error upgrading to Pro' });
    }
};

// Update Profile
export const updateProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { name, gender, age, schoolName, board, classStandard, profilePhoto } = req.body;

    console.log('Update Profile Request for User:', userId);
    console.log('Data:', { name, gender, age, schoolName, board, classStandard, photoPrefix: profilePhoto?.substring(0, 30) });

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                gender,
                age: age ? (isNaN(parseInt(age)) ? undefined : parseInt(age)) : null,
                schoolName,
                board,
                classStandard,
                profilePhoto
            }
        });

        console.log('Update successful for User:', userId);

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                gender: user.gender,
                age: user.age,
                classStandard: user.classStandard,
                schoolName: user.schoolName,
                board: user.board,
                profilePhoto: user.profilePhoto
            }
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};
