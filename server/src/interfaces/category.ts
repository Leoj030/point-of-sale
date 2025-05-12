import { Document, Types } from 'mongoose';
import { IProduct } from '../interfaces/product.js'; // <-- Import your Product interface

export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    imageUrl: string;
    products?: IProduct[]; // Virtual field type
    // Optional fields, in case needed
    createdAt?: Date;
    updatedAt?: Date;
}