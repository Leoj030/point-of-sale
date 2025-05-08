import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    
        const extractedErrors = errors.array().map((err: { path?: string; msg: string }) => ({
            field: err.path || 'unknown',
            message: err.msg,
        }));
        res.status(400).json(errorResponse('Validation failed', extractedErrors));
        return;
    }
    next();
};