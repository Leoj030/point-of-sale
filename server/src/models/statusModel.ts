import mongoose from 'mongoose';
import status from '../enums/status.ts';

const statusSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: status,
        required: true,
        unique: true,
    },
});

const statusModel = mongoose.model('Status', statusSchema);

export default statusModel;
