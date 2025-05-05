import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from 'src/models/user.model.ts';
import { EXPIRE_AT } from './tokenVar.ts';
import { successResponse, errorResponse } from 'src/utils/apiResponse.ts';

const register = async (req: Request, res: Response): Promise<void> => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        res.status(400).json(errorResponse("Missing credentials"));
        return;
    }

    try {
        const existingUser = await userModel.findOne({ username });

        if (existingUser) {
            res.status(400).json(errorResponse("User already exists"));
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await userModel.create({
            name,
            username,
            password: hashedPassword,
        });

        await newUser.save();

        if (!process.env.JWT_SECRET_KEY) {
            throw new Error("JWT_SECRET_KEY is not defined in the environment variables");
        }

        jwt.sign({ id: newUser._id.toString(), tokenVersion: newUser.tokenVersion }, process.env.JWT_SECRET_KEY, { expiresIn: EXPIRE_AT });
        
        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        //     maxAge: MAX_AGE * 24 * 60 * 60 * 1000, // 7 days
        // });

        res.json(successResponse("User registered successfully"));
    } catch (error) {
        res.status(500).json(errorResponse("Internal server error, please try again later."));
        console.error("Error during account registration:", error);
    }
}

export default register;