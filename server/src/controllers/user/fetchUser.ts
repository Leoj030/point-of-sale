import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { IUser } from '../../interfaces/user.js';
import User from '../../models/user.model.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, sort } = req.query as { userId?: string; sort?: string };

        const filter: mongoose.FilterQuery<IUser> = {};

        if (userId && userId.toLowerCase() !== 'all' && userId !== '') {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                res.status(400).json(errorResponse("Invalid user ID format"));
                return;
            }
            filter.category = userId;
        }

        const sortOrder = sort?.toLowerCase() === 'alpha-desc' ? -1 : 1;
        const sortOptions: { [key: string]: 1 | -1 } = { name: sortOrder };

        const userList = await User.find(filter)
            .sort(sortOptions)
            .select(['-password', '-__v', '-tokenVersion'])
            .populate('role', 'name')
            .populate('status', 'name')
            .lean();

        const mappedUsers = userList.map(user => ({
            ...user,
            role: typeof user.role === 'object' && user.role && 'name' in user.role
              ? String(user.role.name).toUpperCase()
              : '',
            status: typeof user.status === 'object' && user.status && 'name' in user.status
              ? String(user.status.name).toLowerCase()
              : '',
        }));

        res.json(successResponse("Users fetched successfully", mappedUsers));
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json(errorResponse("Internal server error, please try again later."));
    }
};

export default getUsers;