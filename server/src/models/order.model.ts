import mongoose, { Schema, Document } from 'mongoose';
import { OrderType, PaymentMethod } from '../enums/status';
import { OrderItemSnapshot } from '../interfaces/order';

export interface IOrder extends Document {
    orderId: string;
    items: OrderItemSnapshot[];
    totalAmount: number;
    amountPaid: number;
    changeGiven: number;
    orderType: OrderType;
    paymentMethod: PaymentMethod;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSnapshotSchema = new Schema<OrderItemSnapshot>({
    id: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
    orderId: { type: String, required: true, unique: true },
    items: { type: [OrderItemSnapshotSchema], required: true },
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    changeGiven: { type: Number, required: true },
    orderType: { type: String, enum: Object.values(OrderType), required: true },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
