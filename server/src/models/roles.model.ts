import mongoose from 'mongoose';
import roles from '../enums/roles';

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: roles,
        required: true,
        unique: true,
    },
});

const userRolesModel = mongoose.model('Role', roleSchema);

export default userRolesModel;
