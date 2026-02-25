import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up storage based on environment
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel ? '/tmp' : path.resolve(__dirname, '../uploads');

// Ensure uploads directory exists (only locally)
if (!isVercel && !fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.warn('Could not create upload directory:', err.message);
    }
}

// Configure storage
const storage = isVercel
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedExtensions = /jpeg|jpg|png|gif|pdf/;
    const allowedMimeTypes = /image\/(jpeg|jpg|png|gif)|application\/pdf/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed!'));
    }
};

// Create multer instance
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});
