import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:5000/api/manager';

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all products
export const getManagerProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

// Update stock
export const updateStock = async (id, { quantity, operation = 'set', notes }) => {
  const response = await api.put(`/products/${id}/stock`, { quantity, operation, notes });
  return response.data;
};

// Update price
export const updatePrice = async (id, price) => {
  const response = await api.put(`/products/${id}/price`, { price });
  return response.data;
};

// Get stock statistics
export const getManagerStockStats = async () => {
  const response = await api.get('/statistics');
  return response.data;
};

// Get all orders
export const getManagerOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

// Get categories
export const getManagerCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export default {
  getManagerProducts,
  updateStock,
  updatePrice,
  getManagerStockStats,
  getManagerOrders,
  updateOrderStatus,
  getManagerCategories
};

