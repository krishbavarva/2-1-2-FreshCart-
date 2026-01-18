import axios from 'axios';
import { authService } from './authService';
import { getApiEndpoint } from '../config/api.js';

const API_URL = getApiEndpoint('rider');

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

// Get all orders
export const getRiderOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

// Get order by ID
export const getRiderOrder = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};

// Get products (read-only)
export const getRiderProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

// Get stock statistics (read-only)
export const getRiderStockStats = async () => {
  const response = await api.get('/statistics');
  return response.data;
};

export default {
  getRiderOrders,
  getRiderOrder,
  updateOrderStatus,
  getRiderProducts,
  getRiderStockStats
};


