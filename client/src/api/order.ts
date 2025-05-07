import API from './axios';
import { OrderHistoryItem, OrderItem } from '../types/order';

export const fetchOrders = async (): Promise<OrderHistoryItem[]> => {
  const res = await API.get<{ data: OrderHistoryItem[] }>('/inventory/orders');
  return res.data.data || [];
};

export const createOrder = async (order: {
  items: OrderItem[];
  orderType: string;
  paymentMethod: string;
  status: string;
}) => {
  return API.post('/inventory/orders', order);
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  return API.put(`/inventory/orders/${orderId}/status`, { status });
};
