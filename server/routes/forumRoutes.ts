import express from 'express';
import { getPosts, createPost, getPost, createReply, likePost } from '../controllers/forumController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.get('/posts', authenticate, getPosts);
router.post('/posts', authenticate, upload.single('file'), createPost);
router.get('/posts/:id', authenticate, getPost);
router.post('/posts/:id/reply', authenticate, createReply);
router.post('/posts/:id/like', authenticate, likePost);

export default router;
