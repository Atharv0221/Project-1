import express from 'express';
import {
    getTimeSpentAnalytics,
    getAccuracyTrend,
    getDifficultyMastery,
    getRankProgression,
    getZenRevisionData
} from '../controllers/analyticsController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/time-spent', authenticate, getTimeSpentAnalytics);
router.get('/accuracy-trend', authenticate, getAccuracyTrend);
router.get('/difficulty-mastery', authenticate, getDifficultyMastery);
router.get('/rank-progression', authenticate, getRankProgression);
router.get('/zen-revision', authenticate, getZenRevisionData);

export default router;
