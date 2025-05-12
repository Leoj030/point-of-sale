import { OrderType, PaymentMethod } from '../enums/status.js';

export interface OrderItemSnapshot {
    id: string;
    productName: string;
    price: number;
    quantity: number;
}

export interface Order {
    orderId: string;
    items: OrderItemSnapshot[];
    orderType: OrderType;
    paymentMethod: PaymentMethod;
    createdBy: string; // user id
    createdAt: Date;
    updatedAt: Date;
}
