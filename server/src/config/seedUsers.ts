import userModel from "../models/user.model.js";
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash("admin", 12);

const seedUsers = async (): Promise<void> => {
    try {
        const existingUsers = await userModel.find();

        if (existingUsers.length === 0) {
            const defaultUsers = [
                { name: "admin", username: "admin", password: hashedPassword, role: "68786f61da34a29e519ad292", status: "68786f61da34a29e519ad29a" },
            ];

            await userModel.insertMany(defaultUsers);
            console.log("Default users created successfully.");
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}

export default seedUsers;