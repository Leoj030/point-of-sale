import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../interfaces/category.ts';

const categorySchema: Schema<ICategory> = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
}, 
{
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false, transform: (doc, ret) => { delete ret.id; return ret; } },
    toObject: { virtuals: true, versionKey: false, transform: (doc, ret) => { delete ret.id; return ret; } },
});

// --- Virtual Field --- \\
categorySchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
    options: { match: { isActive: true } }
});

const categoryModel = mongoose.model<ICategory>('Category', categorySchema);
export default categoryModel;