import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../../models/user.model';
import Roles from '../../models/roles.model';
import { EXPIRE_AT } from '../auth/tokenVar';
import { successResponse, errorResponse } from '../../utils/apiResponse';

const register = async (req: Request, res: Response): Promise<void> => {
    const { name, username, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const roleDoc = await Roles.findOne({ name: role.toLowerCase() });

        if (!roleDoc) {
            res.status(400).json(errorResponse('Role not found.'));
            return;
        }

        const newUser = await userModel.create({
            name,
            username,
            password: hashedPassword,
            role: roleDoc._id,
        });

        await newUser.save();

        if (!process.env.JWT_SECRET_KEY) {
            throw new Error("JWT_SECRET_KEY is not defined in the environment variables");
        }

        jwt.sign({ id: newUser._id.toString(), tokenVersion: newUser.tokenVersion }, process.env.JWT_SECRET_KEY, { expiresIn: EXPIRE_AT });
        
        res.json(successResponse("User registered successfully"));
    } catch (error) {
        res.status(500).json(errorResponse("Internal server error, please try again later."));
        console.error("Error during account registration:", error);
    }
}

export default register;