import { Request, Response } from 'express';
import userModel from '../../models/user.model.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const deletedUser = await userModel.findByIdAndDelete(id);

        if (!deletedUser) {
            res.status(404).json(errorResponse("User not found"));
            return;
        }

        res.json(successResponse("Product deleted successfully", { id: deletedUser._id }));
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json(errorResponse("Internal server error deleting product"));
    }
};

export default deleteUser;