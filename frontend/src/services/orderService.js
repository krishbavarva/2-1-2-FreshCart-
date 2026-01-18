import axios from 'axios';
import { authService } from './authService';
import { getApiEndpoint } from '../config/api.js';

const API_URL = getApiEndpoint('orders');

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

// View receipt in new window
export const viewReceipt = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please login.');
    }
    
    const response = await fetch(`${API_URL}/${orderId}/receipt`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/html'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to load receipt';
      if (response.status === 404) {
        errorMessage = 'Order not found';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication required. Please login.';
      } else if (response.status === 503) {
        errorMessage = 'Service unavailable. Please try again later.';
      }
      throw new Error(errorMessage);
    }
    
    const html = await response.text();
    
    if (!html || html.trim().length === 0) {
      throw new Error('Receipt content is empty');
    }
    
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      throw new Error('Please allow pop-ups to view receipt');
    }
    
    newWindow.document.write(html);
    newWindow.document.close();
  } catch (error) {
    console.error('Error viewing receipt:', error);
    throw error;
  }
};

// Download receipt as PDF file
export const downloadReceipt = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required. Please login.');
    }
    
    const response = await fetch(`${API_URL}/${orderId}/receipt/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf'
      }
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to download receipt';
      if (response.status === 404) {
        errorMessage = 'Order not found';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication required. Please login.';
      } else if (response.status === 503) {
        errorMessage = 'Service unavailable. Please try again later.';
      }
      throw new Error(errorMessage);
    }
    
    // Get PDF as blob
    const blob = await response.blob();
    
    if (!blob || blob.size === 0) {
      throw new Error('Receipt content is empty');
    }
    
    // Extract filename from response headers or use orderId as fallback
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `invoice-${orderId}.pdf`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading receipt:', error);
    throw error;
  }
};

