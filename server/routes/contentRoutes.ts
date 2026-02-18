import express from 'express';
import { getStandards, getSubjects, getChapters, getQuizQuestions, seedContent } from '../controllers/contentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/standards', authenticate, getStandards);
router.get('/subjects', authenticate, getSubjects);
router.get('/subjects/:subjectId/chapters', authenticate, getChapters);
router.get('/quiz/questions', authenticate, getQuizQuestions);
router.post('/seed', seedContent);

export default router;
