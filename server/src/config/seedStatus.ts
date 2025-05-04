import statusModel from "src/models/statusModel.ts";
import status from "src/enums/status.ts";

const seedStatus = async (): Promise<void> => {
    try {
        for (const statusName of Object.values(status)) {
            const existingStatus = await statusModel.findOne({ name: statusName });

            if (!existingStatus) {
                const newStatus = new statusModel({ name: statusName });
                await newStatus.save();

                console.log(`Status '${statusName}' created successfully.`);
            }
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}

export default seedStatus;