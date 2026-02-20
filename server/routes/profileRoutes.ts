import express from 'express';
import { getProfile, updateProfile, upgradeToPro } from '../controllers/profileController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);
router.post('/upgrade', authenticate, upgradeToPro);

export default router;
