import axios from 'axios';
import { authService } from './authService';
import { getApiEndpoint } from '../config/api.js';

const API_URL = getApiEndpoint('admin');

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

// Products
export const getAdminProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getAdminProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Stock Management
export const updateStock = async (id, { quantity, operation = 'set', notes }) => {
  const response = await api.put(`/products/${id}/stock`, { quantity, operation, notes });
  return response.data;
};

// Price Management
export const updatePrice = async (id, price) => {
  const response = await api.put(`/products/${id}/price`, { price });
  return response.data;
};

export const orderNewItems = async (orderData) => {
  const response = await api.post('/orders/new', orderData);
  return response.data;
};

// Statistics
export const getStockStats = async () => {
  const response = await api.get('/statistics');
  return response.data;
};

// Orders
export const getAllOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

// Categories
export const getAdminCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};

// User Management
export const getAllUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await api.put(`/users/${userId}/role`, { role });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export default {
  getAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  updateStock,
  orderNewItems,
  getStockStats,
  getAllOrders,
  getAdminCategories,
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser
};


