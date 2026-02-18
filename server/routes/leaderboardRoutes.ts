import express from 'express';
import {
    getGlobalLeaderboard,
    getStandardLeaderboard,
    getSubjectLeaderboard,
    getUserRank
} from '../controllers/leaderboardController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All leaderboard routes require authentication
router.get('/global', authenticate, getGlobalLeaderboard);
router.get('/standard/:standard', authenticate, getStandardLeaderboard);
router.get('/subject/:subjectId', authenticate, getSubjectLeaderboard);
router.get('/user/:userId/rank', authenticate, getUserRank);

export default router;
