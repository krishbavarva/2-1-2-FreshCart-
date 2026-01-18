import axios from 'axios';
import { getApiEndpoint } from '../config/api.js';

const API_URL = getApiEndpoint('auth');

const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    // Log error for debugging
    console.error('Registration error:', error);
    console.error('Error response:', error.response?.data);
    // Re-throw to let the component handle it
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const getToken = () => {
  return localStorage.getItem('token');
};

export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
};

