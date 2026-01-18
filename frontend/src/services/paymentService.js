import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:5000/api/payment';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout for payment
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
      const status = error.response.status;
      if (status === 401) {
        error.message = 'Authentication required. Please login.';
      } else if (status === 404) {
        error.message = 'Payment service not found. Please restart backend server.';
      } else if (status === 503) {
        error.message = 'Service unavailable. Database may be disconnected.';
      } else if (status === 400) {
        error.message = error.response.data?.message || 'Invalid request. Please check your input.';
      }
    }
    return Promise.reject(error);
  }
);

// Create payment intent
export const createPaymentIntent = async (shippingAddress) => {
  try {
    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.lastName || 
        !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode || 
        !shippingAddress.country) {
      throw new Error('Complete shipping address is required');
    }

    const response = await api.post('/create-intent', { shippingAddress });
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Confirm payment and create order
export const confirmPayment = async (paymentIntentId, shippingAddress, paymentMethod = 'card') => {
  try {
    if (!paymentIntentId) {
      throw new Error('Payment intent ID is required');
    }

    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.lastName || 
        !shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode || 
        !shippingAddress.country) {
      throw new Error('Complete shipping address is required');
    }

    const response = await api.post('/confirm', {
      paymentIntentId,
      shippingAddress,
      paymentMethod
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

