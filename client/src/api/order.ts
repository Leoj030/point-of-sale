import API from './axios';
import { OrderHistoryItem, OrderItem } from '../types/order';

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
  status: string;
  amountPaid: number;
}

interface OrderCreationResponse {
  orderId: string;
  changeGiven: number;
}

export const fetchOrders = async (): Promise<OrderHistoryItem[]> => {
  const res = await API.get<{ data: OrderHistoryItem[] }>('/inventory/orders');
  return res.data.data || [];
};

export const createOrder = async (
  orderData: CreateOrderPayload
): Promise<ApiResponse<OrderCreationResponse>> => {
  try {
    // The backend is expected to return an object matching ApiResponse<OrderCreationResponse>
    // e.g., { success: true, message: "Order created", data: { orderId: "123", changeGiven: 5.50 } }
    const response = await API.post<ApiResponse<OrderCreationResponse>>('/inventory/orders', orderData);
    return response.data; // Axios nests the actual server response in `response.data`
  } catch (error: unknown) { // Typed as unknown
    // Handle and re-throw or format error to match ApiResponse structure
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

export const updateOrderStatus = async (orderId: string, status: string): Promise<ApiResponse<null>> => {
  try {
    const response = await API.put<ApiResponse<null>>(`/inventory/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error: unknown) { // Typed as unknown
    let message = 'An unexpected error occurred while updating order status.';
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


