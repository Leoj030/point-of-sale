import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from 'src/models/user.model.ts';
import { MAX_AGE, EXPIRE_AT } from './tokenVar.ts';
import { successResponse, errorResponse } from 'src/utils/apiResponse.ts';

const login = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json(errorResponse("Missing credentials"));
        return;
    }

    try {
        const user = await userModel.findOne( { username });

        if (!user) {
            res.status(400).json(errorResponse("Invalid credentials"));
            return;
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            res.status(400).json(errorResponse("Invalid credentials"));
            return;
        }

        if (!process.env.JWT_SECRET_KEY) {
            throw new Error("JWT_SECRET_KEY is not defined in the environment variables");
        }

        const token = jwt.sign({ id: user._id.toString(), tokenVersion: user.tokenVersion }, process.env.JWT_SECRET_KEY, { expiresIn: EXPIRE_AT });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: MAX_AGE * 24 * 60 * 60 * 1000,
        });

        res.json(successResponse("Login successful", { token: token }));
    } catch (error) {
        res.status(500).json(errorResponse("Internal server error, please try again later."));
        console.error("Error during login:", error);
    }
}

export default login;