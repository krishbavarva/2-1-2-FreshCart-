// API Configuration
// Uses environment variable in production, localhost in development
const getApiUrl = () => {
  // In production (Replit), use environment variable or current origin
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || window.location.origin + '/api';
  }
  // In development, use localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiUrl();

// Helper function to get full API URL for a specific endpoint
export const getApiEndpoint = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default API_BASE_URL;

