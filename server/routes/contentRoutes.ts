import express from 'express';
import { getSubjects, getQuestionsBySubtopic, seedContent } from '../controllers/contentController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/subjects', authenticate, getSubjects);
router.get('/questions/:subtopicId', authenticate, getQuestionsBySubtopic);
router.post('/seed', seedContent); // Open for dev, or protect in prod

export default router;
