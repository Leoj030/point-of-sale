import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import userModel from '../../models/user.model.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import Roles from '../../models/roles.model.js';
import StatusModel from '../../models/status.model.js';
import statusEnum from '../../enums/status.js';

const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const updateUser = req.body;

    try {
        let updateData = { ...updateUser };

        // Only update password if provided
        if (updateUser.password) {
            updateData.password = await bcrypt.hash(updateUser.password, 12);
        } else {
            delete updateData.password;
        }

        if (updateUser.role) {
            const roleDoc = await Roles.findOne({ name: updateUser.role.toLowerCase() });
            if (!roleDoc) {
                res.status(400).json(errorResponse('Role not found.'));
                return;
            }
            updateData.role = roleDoc._id;
        }

        if (typeof updateUser.isActive === 'boolean') {
            const statusName = updateUser.isActive ? statusEnum.ACTIVE : statusEnum.INACTIVE;
            const statusDoc = await StatusModel.findOne({ name: statusName });
            if (!statusDoc) {
                res.status(400).json(errorResponse('Status not found.'));
                return;
            }
            updateData.status = statusDoc._id;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true });

        if (!updatedUser) {
            res.status(404).json(errorResponse("User not found"));
            return;
        }

        res.json(successResponse("User updated successfully", { id: updatedUser._id }));
    } catch (error) {
        res.status(500).json(errorResponse("Internal server error, please try again later."));
        console.error("Error updating user:", error);
    }
}

export default updateUser;