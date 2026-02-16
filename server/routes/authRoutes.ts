import express from 'express';
import { register, login, updateProfile, changePassword } from '../controllers/authController.js';
import { uploadPhoto, uploadPhotoBase64 } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/update-profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/upload-photo', uploadPhoto);
router.post('/upload-photo-base64', uploadPhotoBase64);

export default router;
