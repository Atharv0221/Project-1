import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for memory storage (we'll save base64)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
}).single('photo');

export const uploadPhoto = (req: Request, res: Response) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            // Convert buffer to base64
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

            res.json({
                message: 'Photo uploaded successfully',
                photoUrl: base64Image
            });
        } catch (error) {
            res.status(500).json({ message: 'Error processing photo', error });
        }
    });
};

// Alternative: Handle base64 upload directly from cropped image
export const uploadPhotoBase64 = (req: Request, res: Response) => {
    try {
        const { photoData } = req.body;

        if (!photoData || !photoData.startsWith('data:image')) {
            return res.status(400).json({ message: 'Invalid photo data' });
        }

        // In a production app, you would:
        // 1. Save to cloud storage (AWS S3, Cloudinary, etc.)
        // 2. Return the public URL
        // For now, we'll just return the base64 data

        res.json({
            message: 'Photo uploaded successfully',
            photoUrl: photoData
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading photo', error });
    }
};
