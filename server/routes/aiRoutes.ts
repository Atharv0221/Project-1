import express from 'express';
import { chatWithMentor, getDailyPlan } from '../controllers/aiController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/chat', authenticate, chatWithMentor);
router.get('/daily-plan', authenticate, getDailyPlan);

export default router;
