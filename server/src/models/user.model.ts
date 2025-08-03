import mongoose from 'mongoose';
import status from '../enums/status';

const userSchema = new mongoose.Schema({
    name: { type: String, rquired: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: mongoose.SchemaTypes.ObjectId, ref: 'Role' },
    status: {type: mongoose.SchemaTypes.ObjectId, ref: 'Status'},
    tokenVersion: { type: Number, default: 0 }
});

userSchema.pre('save', async function (next) {
    
    if (!this.status) {
        try {
            const StatusModel = mongoose.model('Status');
            const activeStatus = await StatusModel.findOne({ name: status.ACTIVE });
            if (activeStatus) {
                this.status = activeStatus._id;
            } else {
                return next(new Error('Default ACTIVE status not found in the database.'));
            }
        } catch (error) {
            return next(error as mongoose.Error);
        }
    }
    next();
});

const userModel = mongoose.model('User', userSchema);

export default userModel;
