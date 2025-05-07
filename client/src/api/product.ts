import API from './axios';
import { Product } from '../types/order';

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await API.get<{ data: Product[] }>('/inventory/products');
  return res.data.data || [];
};
