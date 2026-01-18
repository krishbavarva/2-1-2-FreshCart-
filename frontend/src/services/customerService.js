import axios from 'axios';
import { authService } from './authService';
import { getApiEndpoint } from '../config/api.js';

const API_URL = getApiEndpoint('customer');

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

// Get customer KPIs
export const getCustomerKPIs = async () => {
  const response = await api.get('/kpis');
  return response.data;
};

// Get customer orders
export const getCustomerOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export default {
  getCustomerKPIs,
  getCustomerOrders
};

