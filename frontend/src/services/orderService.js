import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:5000/api/orders';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your connection.';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error. Please check if the server is running.';
    } else if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      if (status === 401) {
        error.message = 'Authentication required. Please login.';
      } else if (status === 404) {
        error.message = 'Order service not found. Please restart backend server.';
      } else if (status === 503) {
        error.message = 'Service unavailable. Database may be disconnected.';
      } else if (status === 400) {
        error.message = error.response.data?.message || 'Invalid request. Please check your input.';
      }
    }
    return Promise.reject(error);
  }
);

export const createOrder = async (orderData) => {
  try {
    if (!orderData || !orderData.shippingAddress) {
      throw new Error('Shipping address is required');
    }
    const response = await api.post('/', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrders = async (page = 1, limit = 10) => {
  try {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    const response = await api.get('/', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    const response = await api.get(`/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    const response = await api.put(`/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

