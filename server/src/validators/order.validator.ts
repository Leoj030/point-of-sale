import { body } from 'express-validator';
import { OrderType, PaymentMethod } from '../enums/status.js';

export const createOrderValidator = [
    body('items')
        .isArray({ min: 1 })
        .withMessage('Order must have at least one item'),
    body('items.*.id').isString().notEmpty(),
    body('items.*.productName').isString().notEmpty(),
    body('items.*.price').isNumeric().toFloat(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('orderType')
        .isIn(Object.values(OrderType))
        .withMessage('Invalid order type'),
    body('paymentMethod')
        .isIn(Object.values(PaymentMethod))
        .withMessage('Invalid payment method'),
];
