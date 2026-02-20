import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all posts (or filtered)
export const getPosts = async (req: Request, res: Response) => {
    const { subjectId, standard, board, sortBy } = req.query;

    try {
        const where: any = {};
        where.parentId = null; // Only top-level posts

        if (subjectId) where.subjectId = String(subjectId);

        // Filter by Standard (User's classStandard OR Subject's standard)
        if (standard) {
            where.OR = [
                { user: { classStandard: String(standard) } },
                { subject: { standard: String(standard) } }
            ];
        }

        // Filter by Board (User's board)
        if (board) {
            where.user = { ...where.user, board: String(board) };
        }

        // Sorting Logic
        let orderBy: any = { createdAt: 'desc' }; // Default: Newest
        if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
        if (sortBy === 'popular') orderBy = { upvotes: 'desc' };

        const posts = await prisma.forumPost.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, profilePhoto: true, classStandard: true, board: true } },
                subject: { select: { id: true, name: true, standard: true } },
                _count: { select: { replies: true } }
            },
            orderBy
        });

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
};

// Create a new post
export const createPost = async (req: Request, res: Response) => {
    const { title, content, subjectId } = req.body;
    const userId = (req as any).user.userId;

    // Get file URL if file was uploaded
    const fileUrl = (req as any).file ? `/uploads/${(req as any).file.filename}` : null;

    try {
        const post = await prisma.forumPost.create({
            data: {
                title,
                content,
                subjectId,
                fileUrl,
                userId
            }
        });
        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating post' });
    }
};

// Get a single post with replies
export const getPost = async (req: Request, res: Response) => {
    const id = req.params.id as string;

    try {
        const post = await prisma.forumPost.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, profilePhoto: true } },
                subject: { select: { id: true, name: true } },
                replies: {
                    include: {
                        user: { select: { id: true, name: true, profilePhoto: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching post' });
    }
};

// Create a reply
export const createReply = async (req: Request, res: Response) => {
    const { content, postId } = req.body; // postId is parentId
    const userId = (req as any).user.userId;

    try {
        // Verify parent exists
        const parent = await prisma.forumPost.findUnique({ where: { id: postId } });
        if (!parent) return res.status(404).json({ message: 'Parent post not found' });

        const reply = await prisma.forumPost.create({
            data: {
                title: `Re: ${parent.title}`,
                content,
                userId,
                parentId: postId,
                subjectId: parent.subjectId
            }
        });
        res.status(201).json(reply);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating reply' });
    }
};

// Like (Upvote) a post
export const likePost = async (req: Request, res: Response) => {
    const id = req.params.id as string;

    try {
        const post = await prisma.forumPost.update({
            where: { id },
            data: { upvotes: { increment: 1 } }
        });
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error upvoting post' });
    }
};
