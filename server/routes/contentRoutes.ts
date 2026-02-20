import express from 'express';
import { getStandards, getSubjects, getChapters, getQuizQuestions, seedContent, getAdaptiveQuestion } from '../controllers/contentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/standards', authenticate, getStandards);
router.get('/subjects', authenticate, getSubjects);
router.get('/subjects/:subjectId/chapters', authenticate, getChapters);
router.get('/quiz/questions', authenticate, getQuizQuestions);
router.get('/adaptive-question', authenticate, getAdaptiveQuestion);
router.post('/seed', seedContent);

export default router;
