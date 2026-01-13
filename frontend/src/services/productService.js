import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:5000/api/products';

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

export const getProducts = async (search = '', page = 1, category = 'all') => {
  const response = await api.get('/', {
    params: { search, page, category }
  });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const searchProducts = async (query) => {
  const response = await api.get('/search', {
    params: { q: query }
  });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

