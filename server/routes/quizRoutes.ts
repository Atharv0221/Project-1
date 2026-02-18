import express from 'express';
import { startQuizSession, submitAnswer, completeQuizSession } from '../controllers/quizController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Start a quiz (POST /api/quiz/start { levelId })
router.post('/start', authenticate, startQuizSession);

// Submit an answer (POST /api/quiz/submit { sessionId, questionId, selectedOptionId, timeTaken })
router.post('/submit', authenticate, submitAnswer);

// Complete a quiz (POST /api/quiz/complete { sessionId })
router.post('/complete', authenticate, completeQuizSession);

export default router;
