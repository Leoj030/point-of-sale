import userModel from "../models/user.model";
import bcrypt from 'bcryptjs';


const seedUsers = async (): Promise<void> => {
    try {
        const existingUsers = await userModel.find();
        const hashedPassword = await bcrypt.hash("admin", 12);

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