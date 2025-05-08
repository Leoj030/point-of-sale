import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log(import.meta.env.VITE_API_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
});

console.log("Axios instance baseURL after creation:", API.defaults.baseURL); // New log

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;