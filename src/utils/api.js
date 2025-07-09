import axios from 'axios';

// API Configuration
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

// Authentication utilities
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }
};

// Authenticated request utility
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    withCredentials: true,
  };

  try {
    const response = await axios(url, config);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired or invalid
      setAuthToken(null);
      window.location.href = '/auth/login';
    }
    throw error;
  }
};

// API client with interceptors
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;