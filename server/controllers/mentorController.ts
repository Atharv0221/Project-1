import { Request, Response } from 'express';
import prisma from '../config/db.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ── Helper: parse JSON fields ──────────────────────────────────────────────────
const safeParseArray = (data: any) => {
    if (!data) return [];
    if (typeof data !== 'string') return Array.isArray(data) ? data : [data];
    try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        return [data];
    }
};

const parseMentor = (mentor: any) => ({
    ...mentor,
    boards: safeParseArray(mentor.boards),
    languages: safeParseArray(mentor.languages),
    standards: safeParseArray(mentor.standards),
    playlists: safeParseArray(mentor.playlists),
    avgRating: mentor.ratings?.length
        ? Math.round((mentor.ratings.reduce((s: number, r: any) => s + r.rating, 0) / mentor.ratings.length) * 10) / 10
        : null,
    totalRatings: mentor.ratings?.length ?? 0,
});

// ── GET /api/mentors ─────────────────────────────────────────────────────────
export const getAllMentors = async (req: Request, res: Response) => {
    try {
        const { board, standard, language } = req.query as any;

        const mentors = await prisma.mentor.findMany({
            where: { isActive: true },
            include: { ratings: { select: { rating: true, comment: true, userId: true, createdAt: true } } },
            orderBy: { createdAt: 'desc' }
        });

        let parsed = mentors.map(parseMentor);

        // Filter client-side (JSON array stored as string)
        if (board) parsed = parsed.filter((m: any) => m.boards.includes(board));
        if (standard) parsed = parsed.filter((m: any) => m.standards.includes(standard));
        if (language) parsed = parsed.filter((m: any) => m.languages.includes(language));

        res.json(parsed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching mentors', error });
    }
};

// ── GET /api/mentors/:id ─────────────────────────────────────────────────────
export const getMentorById = async (req: Request, res: Response) => {
    try {
        const mentor = await prisma.mentor.findUnique({
            where: { id: req.params.id as string },
            include: { ratings: { orderBy: { createdAt: 'desc' } } }
        });
        if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
        res.json(parseMentor(mentor));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching mentor', error });
    }
};

// ── POST /api/mentors  (Admin only) ─────────────────────────────────────────
export const createMentor = async (req: Request, res: Response) => {
    try {
        const { name, email, youtubeChannel, boards, languages, standards, playlists, bio } = req.body;
        if (!name || !email || !boards || !languages || !standards)
            return res.status(400).json({ message: 'name, email, boards, languages, standards are required' });

        let profilePicture = null;
        if (req.file) {
            profilePicture = `/uploads/${req.file.filename}`;
        }

        const parsedPlaylists = typeof playlists === 'string' ? playlists : JSON.stringify(playlists || []);

        const mentor = await prisma.mentor.create({
            data: {
                name,
                email,
                youtubeChannel,
                boards: JSON.stringify(Array.isArray(boards) ? boards : [boards]),
                languages: JSON.stringify(Array.isArray(languages) ? languages : [languages]),
                standards: JSON.stringify(Array.isArray(standards) ? standards : [standards]),
                playlists: parsedPlaylists,
                bio,
                profilePicture,
            },
            include: { ratings: true }
        });
        res.status(201).json(parseMentor(mentor));
    } catch (error: any) {
        if (error.code === 'P2002') return res.status(400).json({ message: 'A mentor with this email already exists.' });
        res.status(500).json({ message: 'Error creating mentor', error });
    }
};

// ── PUT /api/mentors/:id  (Admin only) ──────────────────────────────────────
export const updateMentor = async (req: Request, res: Response) => {
    try {
        const { name, email, youtubeChannel, boards, languages, standards, playlists, bio, isActive } = req.body;

        const updateData: any = {
            name, email, youtubeChannel, bio,
            ...(boards && { boards: JSON.stringify(Array.isArray(boards) ? boards : [boards]) }),
            ...(languages && { languages: JSON.stringify(Array.isArray(languages) ? languages : [languages]) }),
            ...(standards && { standards: JSON.stringify(Array.isArray(standards) ? standards : [standards]) }),
        };

        if (playlists !== undefined) {
            updateData.playlists = typeof playlists === 'string' ? playlists : JSON.stringify(playlists || []);
        }

        if (isActive !== undefined) {
            updateData.isActive = isActive === 'true' || isActive === true;
        }

        if (req.file) {
            updateData.profilePicture = `/uploads/${req.file.filename}`;
        }

        const mentor = await prisma.mentor.update({
            where: { id: req.params.id as string },
            data: updateData,
            include: { ratings: true }
        });
        res.json(parseMentor(mentor));
    } catch (error) {
        res.status(500).json({ message: 'Error updating mentor', error });
    }
};

// ── DELETE /api/mentors/:id  (Admin only) ───────────────────────────────────
export const deleteMentor = async (req: Request, res: Response) => {
    try {
        await prisma.mentor.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'Mentor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting mentor', error });
    }
};

// ── POST /api/mentors/:id/request  (Student) ────────────────────────────────
export const requestMeeting = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { message, availabilityId } = req.body;

        if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });
        if (!availabilityId) return res.status(400).json({ message: 'A specific availability slot must be selected' });

        const [mentor, student, slot] = await Promise.all([
            prisma.mentor.findUnique({ where: { id: req.params.id as string } }),
            prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, mentoringHoursRemaining: true } }),
            prisma.mentorAvailability.findUnique({ where: { id: availabilityId } })
        ]);

        if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
        if (!student) return res.status(404).json({ message: 'Student not found' });
        if (!slot) return res.status(404).json({ message: 'Availability slot not found' });
        if (slot.isBooked) return res.status(400).json({ message: 'This slot has already been booked' });

        // Enforce Subscription Logic
        if (student.mentoringHoursRemaining < 1) {
            return res.status(403).json({
                message: 'You have NO mentoring hours remaining. Please purchase a plan (₹2000 for 6 hours) to book a session.'
            });
        }

        const sessionDate = slot.startTime;

        // Generate a simple, free Jitsi Meet link
        const meetingPointerId = Math.random().toString(36).substring(2, 12);
        const meetingLink = `https://meet.jit.si/YatsyaSession-${meetingPointerId}`;

        const session = await prisma.$transaction([
            // 1. Create the session
            prisma.mentorshipSession.create({
                data: {
                    mentorId: mentor.id,
                    studentId: student.id,
                    scheduledAt: sessionDate,
                    meetingLink,
                    status: 'SCHEDULED',
                    availabilityId: slot.id
                }
            }),
            // 2. Mark slot as booked
            prisma.mentorAvailability.update({
                where: { id: slot.id },
                data: { isBooked: true }
            }),
            // 3. Subtract 1 hour from student
            prisma.user.update({
                where: { id: student.id },
                data: { mentoringHoursRemaining: { decrement: 1 } }
            })
        ]);

        const sessionResult = session[0];

        await transporter.sendMail({
            from: `"Yatsya Platform" <${process.env.EMAIL_USER}>`,
            to: mentor.email,
            replyTo: student.email,
            subject: `Meeting Request from ${student.name} — Yatsya`,
            html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0B1120;color:#e2e8f0;border-radius:16px;padding:32px;">
                    <h2 style="color:#22d3ee;margin-bottom:4px;">📚 New Meeting Request</h2>
                    <p style="color:#94a3b8;margin-top:0;">via Yatsya Adaptive Learning Platform</p>
                    <hr style="border:1px solid #1e293b;margin:24px 0;">
                    <p><strong>Student Name:</strong> ${student.name}</p>
                    <p><strong>Student Email:</strong> <a href="mailto:${student.email}" style="color:#22d3ee;">${student.email}</a></p>
                    <p><strong>Requested Date:</strong> ${sessionDate.toLocaleString()}</p>
                    <p><strong>Video Meeting Pointer:</strong> <a href="${meetingLink}" style="color:#22d3ee;">${meetingLink}</a></p>
                    <p><strong>Message:</strong></p>
                    <blockquote style="background:#1e293b;border-left:4px solid #22d3ee;padding:16px;border-radius:8px;margin:8px 0;">
                        ${message.replace(/\n/g, '<br>')}
                    </blockquote>
                    <hr style="border:1px solid #1e293b;margin:24px 0;">
                    <p style="color:#64748b;font-size:12px;">You can reply directly to this email to contact the student.</p>
                </div>
            `
        });

        res.json({
            message: 'Meeting request confirmed. 1 hour has been deducted from your plan.',
            session: sessionResult,
            hoursRemaining: (student as any).mentoringHoursRemaining - 1
        });
    } catch (error: any) {
        console.error('Meeting request error:', error);
        res.status(500).json({ message: 'Failed to confirm meeting request', error: error.message });
    }
};

export const getMentorAvailability = async (req: Request, res: Response) => {
    try {
        const slots = await prisma.mentorAvailability.findMany({
            where: {
                mentorId: req.params.id,
                isBooked: false,
                startTime: { gte: new Date() }
            },
            orderBy: { startTime: 'asc' }
        });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching availability', error });
    }
};

// ── POST /api/mentors/:id/rate  (Student) ───────────────────────────────────
export const rateMentor = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5)
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });

        const mentor = await prisma.mentor.findUnique({ where: { id: req.params.id as string } });
        if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

        const result = await prisma.mentorRating.upsert({
            where: { mentorId_userId: { mentorId: req.params.id as string, userId } },
            update: { rating, comment },
            create: { mentorId: req.params.id as string, userId, rating, comment }
        });

        res.json({ message: 'Rating submitted', rating: result });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting rating', error });
    }
};
