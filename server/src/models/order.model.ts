import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus, OrderType, PaymentMethod } from '../enums/status.js';
import { OrderItemSnapshot } from '../interfaces/order.js';

export interface IOrder extends Document {
    orderId: string;
    items: OrderItemSnapshot[];
    orderType: OrderType;
    paymentMethod: PaymentMethod;
    status: OrderStatus;
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
    orderType: { type: String, enum: Object.values(OrderType), required: true },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.Pending },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
