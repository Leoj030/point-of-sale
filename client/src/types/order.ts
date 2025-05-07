// Category, Product, OrderItem, OrderHistoryItem interfaces
export interface Category {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface OrderHistoryItem {
  orderId: string;
  items: OrderItem[];
  orderType: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { username: string } | string;
}
