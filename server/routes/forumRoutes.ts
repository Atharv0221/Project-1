import express, { Request, Response, NextFunction } from 'express';
import { getPosts, createPost, getPost, createReply, likePost } from '../controllers/forumController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';
import multer from 'multer';

const router = express.Router();

// Wrap multer upload with error handling so bad file types return a clear 400 error
const uploadWithErrorHandling = (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors (e.g. file too large)
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            // Custom fileFilter error (wrong file type)
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

router.get('/posts', authenticate, getPosts);
router.post('/posts', authenticate, uploadWithErrorHandling, createPost);
router.get('/posts/:id', authenticate, getPost);
router.post('/posts/:id/reply', authenticate, createReply);
router.post('/posts/:id/like', authenticate, likePost);

export default router;
