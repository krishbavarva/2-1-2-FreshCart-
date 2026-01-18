import axios from 'axios';
import { authService } from './authService';
import { getApiEndpoint } from '../config/api.js';

const API_URL = getApiEndpoint('cart');

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
        error.message = 'Cart service not found. Please restart backend server.';
      } else if (status === 503) {
        error.message = 'Service unavailable. Database may be disconnected.';
      }
    }
    return Promise.reject(error);
  }
);

export const getCart = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error getting cart:', error);
    throw error;
  }
};

export const addToCart = async (product) => {
  try {
    const response = await api.post('/', product);
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (itemId, quantity) => {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    
    // Clean itemId - remove any trailing colons or invalid characters
    const cleanItemId = String(itemId).replace(/[:\s]+$/g, '').trim();
    
    if (!quantity || quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    
    // Ensure the URL is correct - must be /item/:itemId
    const url = `/item/${cleanItemId}`;
    console.log('🛒 Updating cart item:', { itemId: cleanItemId, quantity, url, fullUrl: `${API_URL}${url}` });
    
    const response = await api.put(url, { quantity });
    return response.data;
  } catch (error) {
    console.error('❌ Error updating cart item:', error);
    console.error('   Request URL:', error.config?.url);
    console.error('   Full URL:', error.config?.url ? `${API_URL}${error.config.url}` : 'N/A');
    throw error;
  }
};

export const removeFromCart = async (itemId) => {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    const response = await api.delete(`/item/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await api.delete('/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

