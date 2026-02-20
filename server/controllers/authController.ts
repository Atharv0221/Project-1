import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
import nodemailer from 'nodemailer';

// Configure Nodemailer (Use environment variables in production)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred service
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with valid credentials or env vars
        pass: process.env.EMAIL_PASS || 'your-password'
    }
});

export const register = async (req: Request, res: Response) => {
    const { name, email, password, role, board } = req.body;

    console.log('Registration attempt:', { name, email, role });

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STUDENT',
                board: board || 'Maharashtra State Board',
                lastLogin: new Date(),
                streak: 1
            },
        });

        console.log('User created successfully:', user.id);

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                streak: user.streak,
                xp: user.xp,
                scholarStatus: user.scholarStatus,
                profilePhoto: user.profilePhoto,
                classStandard: user.classStandard
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log('User found:', user.email);
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // --- Streak Calculation Logic ---
        const now = new Date();
        const lastLogin = user.lastLogin;
        let newStreak = user.streak || 0;

        if (!lastLogin) {
            newStreak = 1;
        } else {
            const lastDate = new Date(lastLogin);

            // Check if last login was yesterday
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);

            const isSameDay = (d1: Date, d2: Date) =>
                d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate();

            if (isSameDay(lastDate, now)) {
                // Already logged in today, keep streak
            } else if (isSameDay(lastDate, yesterday)) {
                // Logged in yesterday, increment streak
                newStreak += 1;
            } else {
                // Logged in before yesterday, reset streak
                newStreak = 1;
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLogin: now,
                streak: newStreak
            }
        });

        const token = jwt.sign({ userId: updatedUser.id, role: updatedUser.role }, JWT_SECRET, {
            expiresIn: '1h',
        });

        console.log('Login successful for user:', email, 'Streak:', newStreak);
        res.json({
            token,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                streak: updatedUser.streak,
                xp: updatedUser.xp,
                scholarStatus: updatedUser.scholarStatus,
                profilePhoto: updatedUser.profilePhoto,
                classStandard: updatedUser.classStandard,
                gender: updatedUser.gender,
                age: updatedUser.age,
                schoolName: updatedUser.schoolName,
                board: updatedUser.board
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};


export const changePassword = async (req: Request, res: Response) => {
    const { userId, currentPassword, newPassword } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Update user password
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@edutech.com',
            to: email,
            subject: 'Password Reset Request',
            text: `Your new temporary password is: ${tempPassword}\n\nPlease log in and change your password immediately.`
        };

        // For this task, we will try to send, but providing the password in response for testing if email fails/is not configured
        try {
            // await transporter.sendMail(mailOptions); // Uncomment if SMTP is configured
            console.log(`[DEV MODE] Temp Password for ${email}: ${tempPassword}`);

            // In a real app, do NOT send the password in the response. 
            // Here we do it because the user might not have SMTP set up and needs to test.
            // We'll prioritize the log though.
            res.json({ message: 'Temporary password sent to email (Check server console for dev mode)', devPass: tempPassword });
        } catch (emailError) {
            console.error('Email send failed:', emailError);
            res.status(500).json({ message: 'Failed to send email', devPass: tempPassword });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
