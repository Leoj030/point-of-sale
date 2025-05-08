import userRolesModel from '../models/roles.model.js';
import roles from '../enums/roles.js';

const seedRoles = async (): Promise<void> => {
    try {
        for (const roleName of Object.values(roles)) {
            const existingRole = await userRolesModel.findOne({ name: roleName });

            if (!existingRole) {
                const newRole = new userRolesModel({ name: roleName });
                await newRole.save();

                console.log(`Role '${roleName}' created successfully.`);
            }
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

export default seedRoles;