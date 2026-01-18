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

export const getProducts = async (search = '', page = 1, category = 'all', filters = {}) => {
  const params = { search, page, category };
  
  // Add filter parameters
  if (filters.proteinMin) params.proteinMin = filters.proteinMin;
  if (filters.nutriscoreGrade && filters.nutriscoreGrade !== 'all') params.nutriscoreGrade = filters.nutriscoreGrade;
  if (filters.bestSeller === true) params.bestSeller = 'true';
  if (filters.filter) params.filter = filters.filter;
  
  const response = await api.get('/', { params });
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

export const toggleLike = async (productId) => {
  const response = await api.post(`/${productId}/like`);
  return response.data;
};

export const getProductByBarcode = async (barcode) => {
  const response = await api.get(`/barcode/${barcode}`);
  return response.data;
};

export const getLikedProducts = async () => {
  const response = await api.get('/liked');
  return response.data;
};

