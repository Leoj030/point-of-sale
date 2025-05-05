import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../interfaces/product.ts';

const ProductSchema: Schema<IProduct> = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    isActive: { type: Boolean, default: true },
  }, 
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false, transform: (doc, ret) => { delete ret.id; return ret; } },
    toObject: { virtuals: true, versionKey: false, transform: (doc, ret) => { delete ret.id; return ret; } },
  });

const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
export default ProductModel;