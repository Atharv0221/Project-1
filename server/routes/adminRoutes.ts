import express from 'express';
import { getSystemStats, getAllUsers, updateUserRole, addMentorAvailability, deleteMentorAvailability, addSubscriptionHours } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

// Mentorship & Subscription Management
router.post('/mentors/availability', addMentorAvailability);
router.delete('/mentors/availability/:id', deleteMentorAvailability);
router.post('/users/subscription', addSubscriptionHours);

export default router;
