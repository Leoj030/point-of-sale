import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { errorResponse } from '../utils/apiResponse.js';
import roles from '../enums/roles.js';
import status from '../enums/status.js';
import { PopulatedRole, PopulatedStatus, PopulatedUser, AuthenticatedRequest, JwtPayload } from '../interfaces/authMiddleware.js'

// --- Main Authentication Middleware --- \\
export const isAuthenticated = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json(errorResponse('Authentication required: No token provided'));
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        if (!process.env.JWT_SECRET_KEY) {
            throw new Error("JWT_SECRET_KEY is not defined in the environment variables");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY) as JwtPayload;

        if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
             res.status(401).json(errorResponse('Authentication failed: Invalid token payload'));
             return;
        }

        const user = await User.findById(decoded.id)
            .populate<{ role: PopulatedRole }>('role')
            .populate<{ status: PopulatedStatus }>('status')
            .lean();

        if (!user) {
            res.status(401).json(errorResponse('Authentication failed: User not found'));
            return;
        }

        if (!user.role || !user.status) {
             console.error(`User ${user._id} has missing role or status reference.`);
             res.status(403).json(errorResponse('Forbidden: User configuration error'));
             return;
        }

        if (user.status.name !== status.ACTIVE) {
            res.status(403).json(errorResponse(`Forbidden: User account is not active (${user.status.name})`));
            return;
        }

        if (decoded.tokenVersion !== user.tokenVersion) {
            console.log(`Token version mismatch for user ${user._id}. Token: ${decoded.tokenVersion}, DB: ${user.tokenVersion}`);
            
            res.status(401).json(errorResponse('Authentication failed: Session invalidated'));
            return;
        }

        req.user = user as PopulatedUser;

        next();

    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("Authentication error:", err.message);

        if (err.name === 'JsonWebTokenError') {
            res.status(401).json(errorResponse('Authentication failed: Invalid token'));
        } else if (err.name === 'TokenExpiredError') {
            res.status(401).json(errorResponse('Authentication failed: Token expired'));
        } else {
            res.status(500).json(errorResponse('Internal server error during authentication'));
        }
    }
};


// --- Role Checking Middleware --- \\
export const checkRole = (requiredRole: roles) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    
        if (!req.user) {
            res.status(401).json(errorResponse('Authentication required (user not found on request)'));
            return;
        }

        if (!req.user.role || !req.user.role.name) {
            console.warn(`User ${req.user._id} is authenticated but role information is missing or incomplete.`);
            res.status(403).json(errorResponse('Forbidden: Role information missing'));
            return;
        }

        if (req.user.role.name !== requiredRole) {
            res.status(403).json(errorResponse(`Forbidden: Requires ${requiredRole} role. You have ${req.user.role.name}.`));
            return;
        }

        next();
    };
};