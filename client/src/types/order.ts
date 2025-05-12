export interface Category {
  _id: string;
  name: string;
  imageUrl: string; // Added imageUrl for category images
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  quantity: number;
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
  createdAt: string;
  updatedAt: string;
  createdBy?: { username: string } | string;
}
