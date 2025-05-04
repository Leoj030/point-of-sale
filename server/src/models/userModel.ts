import mongoose from 'mongoose';
import roles from '../enums/roles.ts';

const userSchema = new mongoose.Schema({
    name: { type: String, rquired: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifiedOtp: { type: String, default: '' },
    verifiedOtpExpiry: { type: Number, default: 0 },
    isEmailVerified: { type: Boolean, default: false },
    OtpExpiry: { type: Number, default: 0 },
    role: { type: mongoose.SchemaTypes.ObjectId, ref: 'Role' },
});

userSchema.pre('save', async function (next) {
    if (!this.role) {
        try {
            const RoleModel = mongoose.model('Role');
            const studentRole = await RoleModel.findOne({
                name: roles.CASHIER,
            });
            if (studentRole) {
                this.role = studentRole._id;
            } else {
                return next(
                    new Error('Default cashier role not found in the database.')
                );
            }
        } catch (error) {
            return next(error as mongoose.Error);
        }
    }
    next();
});

const userModel = mongoose.model('User', userSchema);

export default userModel;
