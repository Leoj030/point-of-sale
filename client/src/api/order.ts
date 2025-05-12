import { OrderHistoryItem, OrderItem } from '../types/order';
import API from './axios';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

interface CreateOrderPayload {
  items: OrderItem[];
  orderType: string;
  paymentMethod: string;
  amountPaid: number;
}

interface OrderCreationResponse {
  orderId: string;
  changeGiven: number;
}

export const fetchOrders = async (): Promise<OrderHistoryItem[]> => {
  const res = await API.get<{ data: OrderHistoryItem[] }>('/orders');
  return res.data.data || [];
};

export const createOrder = async (
  orderData: CreateOrderPayload
): Promise<ApiResponse<OrderCreationResponse>> => {
  try {
    const response = await API.post<ApiResponse<OrderCreationResponse>>('/orders', orderData);
    return response.data;
  } catch (error: unknown) {
    let message = 'An unexpected error occurred during order creation.';
    let errorData: unknown = error;

    if (typeof error === 'object' && error !== null) {
        if ('response' in error && (error as { response?: { data?: { message?: string } } }).response?.data?.message) {
            message = (error as { response: { data: { message: string } } }).response.data.message;
            errorData = (error as { response: { data: unknown } }).response.data;
        } else if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
            message = (error as { message: string }).message;
        }
    }

    return {
      success: false,
      message: message,
      data: undefined,
      error: errorData,
    };
  }
};

export const deleteOrder = async (orderId: string): Promise<ApiResponse<null>> => {
  try {
    const response = await API.delete<ApiResponse<null>>(`/orders/${orderId}`);
    return response.data;
  } catch (error: unknown) {
    let message = 'An unexpected error occurred while deleting the order.';
    let errorData: unknown = error;

    if (typeof error === 'object' && error !== null) {
        if ('response' in error && (error as { response?: { data?: { message?: string } } }).response?.data?.message) {
            message = (error as { response: { data: { message: string } } }).response.data.message;
            errorData = (error as { response: { data: unknown } }).response.data;
        } else if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
            message = (error as { message: string }).message;
        }
    }
    return {
      success: false,
      message,
      error: errorData,
    };
  }
};


