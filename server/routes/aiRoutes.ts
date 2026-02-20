import express from 'express';
import { chatWithMentor, getDailyPlan, getRemediation } from '../controllers/aiController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/chat', authenticate, chatWithMentor);
router.post('/remediation', authenticate, getRemediation);
router.get('/daily-plan', authenticate, getDailyPlan);

export default router;
