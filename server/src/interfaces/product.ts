import { Document, Types } from 'mongoose';

export interface IProduct extends Document {
    _id: Types.ObjectId;
    category: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isActive?: boolean;
    // Optional: Add fields like 'isBestSeller' if needed later
    // isBestSeller?: boolean;
}