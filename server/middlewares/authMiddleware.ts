import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

interface AuthRequest extends Request {
    user?: any;
    userId?: string; // Added userId to AuthRequest
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string, id?: string, role: string };
        const userId = decoded.userId || decoded.id;

        if (!userId) {
            res.status(401).json({ message: 'Token invalid: Missing user ID' });
            return;
        }

        req.user = { userId: userId, role: decoded.role };
        req.userId = userId; // Keep for backward compatibility
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'User role is not authorized' });
        }
        next();
    };
};
