import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log("VITE_API_URL from import.meta.env (in api.js):", import.meta.env.VITE_API_URL);
console.log("Final API_BASE_URL being used (in api.js):", API_BASE_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;