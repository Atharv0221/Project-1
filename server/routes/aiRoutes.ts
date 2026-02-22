import express from 'express';
import { chatWithMentor, getDailyPlan, getRemediation, getChatHistory, getConversationMessages, clearChatHistory } from '../controllers/aiController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/chat', authenticate, chatWithMentor);
router.post('/remediation', authenticate, getRemediation);
router.get('/daily-plan', authenticate, getDailyPlan);

// Persistence Routes
router.get('/conversations', authenticate, getChatHistory);
router.get('/conversations/:id', authenticate, getConversationMessages);
router.delete('/conversations', authenticate, clearChatHistory);

export default router;
