import { Response } from 'express';
import { successResponse, errorResponse } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../../interfaces/authMiddleware'; // Adjust path if needed
import userModel from '../../models/user.model';

const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json(errorResponse('Authentication required for logout'));
            return;
        }

        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        const userId = req.user._id;

        await userModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
        res.json(successResponse("Logout successful"));
    } catch (error) {
        res.status(500).json(errorResponse("Internal server error, please try again later."));
        console.error("Error during logout:", error);
    }
}

export default logout;