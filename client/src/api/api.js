import axios from "axios";

const BASE_URL = "http://localhost:8000/api"; // backend URL

export const fetchOrders = () => axios.get(`${BASE_URL}/orders`);

export const fetchInventory = () => axios.get(`${BASE_URL}/inventory`);
export const createProduct = (product) => axios.post(`${BASE_URL}/inventory`, product);
export const updateProduct = (id, product) => axios.put(`${BASE_URL}/inventory/${id}`, product);
export const deleteProduct = (id) => axios.delete(`${BASE_URL}/inventory/${id}`);

export const fetchReports = () => axios.get(`${BASE_URL}/reports`);
export const fetchStaff = () => axios.get(`${BASE_URL}/staff`);