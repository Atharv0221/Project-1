import express from 'express';
import { register, login, changePassword, forgotPassword } from '../controllers/authController.js';
import { uploadPhoto, uploadPhotoBase64 } from '../controllers/uploadController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/change-password', authenticate, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/upload-photo', uploadPhoto);
router.post('/upload-photo-base64', uploadPhotoBase64);

export default router;
