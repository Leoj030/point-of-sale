import API from './axios';
import { Category } from '../types/order';

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await API.get<{ data: Category[] }>('/inventory/categories');
  return res.data.data || [];
};
