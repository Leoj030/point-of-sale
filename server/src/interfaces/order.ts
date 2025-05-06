import { OrderType, PaymentMethod, OrderStatus } from '../enums/status.ts';

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
    status: OrderStatus;
    createdBy: string; // user id
    createdAt: Date;
    updatedAt: Date;
}
