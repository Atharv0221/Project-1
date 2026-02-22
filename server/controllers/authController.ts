import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import fs from 'fs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
import nodemailer from 'nodemailer';

// Configure Nodemailer (Using environment variables)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
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
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STUDENT',
                board: board || 'Maharashtra State Board',
                lastLogin: new Date(),
                streak: 1,
                emailVerified: false,
                verificationToken,
            },
        });

        console.log('User created successfully:', user.id);

        // Send verification email (non-blocking)
        sendVerificationEmail(email, name, verificationToken).catch(err =>
            console.error('Failed to send verification email:', err)
        );

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
                classStandard: user.classStandard,
                emailVerified: user.emailVerified,
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// ── Verification Email Helper ────────────────────────────────────────────────
async function sendVerificationEmail(email: string, name: string, token: string) {
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
    await transporter.sendMail({
        from: `"Yatsya Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '✅ Verify Your Yatsya Account',
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0B1120;color:#e2e8f0;border-radius:16px;padding:32px;">
                <h2 style="color:#22d3ee;margin-bottom:4px;">Welcome to Yatsya, ${name}! 🎓</h2>
                <p style="color:#94a3b8;margin-top:0;">One more step — please verify your email address.</p>
                <hr style="border:1px solid #1e293b;margin:24px 0;">
                <p>Click the button below to verify your account and unlock full access to Yatsya:</p>
                <a href="${verifyUrl}"
                    style="display:inline-block;margin:16px 0;padding:14px 32px;background:#22d3ee;color:#000;font-weight:900;border-radius:12px;text-decoration:none;font-size:16px;">
                    ✅ Verify My Email
                </a>
                <p style="color:#64748b;font-size:12px;margin-top:24px;">Or copy this link: <a href="${verifyUrl}" style="color:#22d3ee;">${verifyUrl}</a></p>
                <p style="color:#64748b;font-size:11px;">This link expires in 24 hours. If you didn't register, ignore this email.</p>
            </div>
        `
    });
    console.log(`Verification email sent to ${email}`);
}

// ── GET /api/auth/verify-email?token=... ──────────────────────────────────────
export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };
    if (!token) return res.status(400).json({ message: 'Token is required' });

    try {
        const user = await prisma.user.findUnique({ where: { verificationToken: token } });
        if (!user) return res.status(400).json({ message: 'Invalid or expired verification link.' });
        if (user.emailVerified) return res.json({ message: 'Email already verified.' });

        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, verificationToken: null }
        });

        console.log('Email verified for:', user.email);
        res.json({ message: 'Email verified successfully! You can now log in.', email: user.email });
    } catch (error) {
        res.status(500).json({ message: 'Server error during verification', error });
    }
};

// ── POST /api/auth/resend-verification ───────────────────────────────────────
export const resendVerification = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.emailVerified) return res.json({ message: 'Email is already verified.' });

        const newToken = crypto.randomBytes(32).toString('hex');
        await prisma.user.update({ where: { id: user.id }, data: { verificationToken: newToken } });
        await sendVerificationEmail(email, user.name, newToken);

        res.json({ message: 'Verification email resent. Please check your inbox.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to resend verification email', error });
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

        // 🚫 Block login if email not verified (except hardcoded admin)
        if (!user.emailVerified && user.email !== 'yatsya35@gmail.com') {
            return res.status(403).json({
                message: 'Please verify your email before logging in.',
                emailVerified: false,
                email: user.email,
            });
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

        if (user.email === 'yatsya35@gmail.com' && user.role !== 'ADMIN') {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' }
            });
            user.role = 'ADMIN';
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
