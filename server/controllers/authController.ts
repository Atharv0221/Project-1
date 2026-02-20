import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
import nodemailer from 'nodemailer';

// Configure Nodemailer (Using environment variables)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Standard for Gmail
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log('Initializing SMTP with user:', process.env.EMAIL_USER);

// Verify connection configuration
transporter.verify((error, success) => {
    const logPath = './smtp-debug.log';
    if (error) {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] SMTP Connection Error: ${JSON.stringify(error)}\n`);
        console.error('SMTP Connection Error:', error);
    } else {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] SMTP Server is ready\n`);
        console.log('SMTP Server is ready to take our messages');
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

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Password reset email sent to ${email}`);

            // In production, we don't return the password in the response.
            // But we can include a help message.
            res.json({
                message: 'A temporary password has been sent to your email. Please check your inbox (and spam folder).'
            });
        } catch (emailError: any) {
            const logPath = './smtp-debug.log';
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] Email Send Failed for ${email}: ${emailError.message}\n`);
            console.error('Email send failed:', emailError);

            // Log the temp password for dev fallback if sending fails
            console.log(`[DEV FALLBACK] Temp Password for ${email}: ${tempPassword}`);

            res.status(500).json({
                message: 'Failed to send reset email. Please try again later or contact support.',
                error: emailError.message,
                devPass: tempPassword // Always return temp password for now to allow user to continue
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
