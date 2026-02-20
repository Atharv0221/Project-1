import express from 'express';
import { getNotifications, markAsRead, syncNotifications } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.post('/sync', authenticate, syncNotifications);
router.put('/:id/read', authenticate, markAsRead);

export default router;
