import API from './axios';
import { Category } from '../types/order';

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await API.get<{ data: Category[] }>('/inventory/categories');
  return res.data.data || [];
};

export const createCategory = async (data: { name: string }): Promise<Category> => {
  const res = await API.post<{ data: Category }>('/inventory/categories', data);
  return res.data.data;
};

export const updateCategory = async (id: string, data: { name: string }): Promise<Category> => {
  const res = await API.put<{ data: Category }>(`/inventory/categories/${id}`, data);
  return res.data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await API.delete(`/inventory/categories/${id}`);
};
