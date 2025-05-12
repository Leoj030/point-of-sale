import { Product } from '../types/order';
import API from './axios';

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await API.get<{ data: Product[] }>('/inventory/products');
  return res.data.data;
};

export const createProduct = async (product: Omit<Product, '_id'>) => {
  const res = await API.post('/inventory/products', product);
  return res.data;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const res = await API.put(`/inventory/products/${id}`, product);
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await API.delete(`/inventory/products/${id}`);
  return res.data;
};