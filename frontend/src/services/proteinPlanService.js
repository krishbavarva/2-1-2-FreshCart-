import axios from 'axios';
import { authService } from './authService';

const API_URL = 'http://localhost:5000/api/products';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProteinPlan = async (userData) => {
  const response = await api.post('/protein-plan', userData);
  return response.data;
};
