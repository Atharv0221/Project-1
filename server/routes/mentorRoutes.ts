import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
    getAllMentors,
    getMentorById,
    createMentor,
    updateMentor,
    deleteMentor,
    requestMeeting,
    rateMentor
} from '../controllers/mentorController.js';

const router = express.Router();

// Middleware: Admin check
const adminOnly = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
    next();
};

router.get('/', authenticate, getAllMentors);
router.get('/:id', authenticate, getMentorById);
router.post('/', authenticate, adminOnly, createMentor);
router.put('/:id', authenticate, adminOnly, updateMentor);
router.delete('/:id', authenticate, adminOnly, deleteMentor);
router.post('/:id/request', authenticate, requestMeeting);
router.post('/:id/rate', authenticate, rateMentor);

export default router;
