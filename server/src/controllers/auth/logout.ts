import { Request, Response } from 'express';
import { successResponse, errorResponse } from 'src/utils/apiResponse.ts';

const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        res.json(successResponse("Logout successful"));
    } catch (error) {
        res.status(500).json(errorResponse("Internal server error, please try again later."));
        console.error("Error during logout:", error);
    }
}

export default logout;