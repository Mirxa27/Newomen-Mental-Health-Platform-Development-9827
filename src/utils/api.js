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

// API Endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: (data) => apiClient.post('/auth/login', data),
    register: (data) => apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout'),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
    verifyToken: () => apiClient.get('/auth/verify'),
    updateProfile: (data) => apiClient.put('/auth/profile', data),
    changePassword: (data) => apiClient.post('/auth/change-password', data),
  },

  // User endpoints
  user: {
    getProfile: () => apiClient.get('/user/profile'),
    updateProfile: (data) => apiClient.put('/user/profile', data),
    updateSettings: (data) => apiClient.put('/user/settings', data),
    deleteAccount: () => apiClient.delete('/user/account'),
    exportData: () => apiClient.get('/user/export'),
  },

  // Chat endpoints
  chat: {
    sendMessage: (message) => apiClient.post('/chat', { message }),
    getHistory: (params) => apiClient.get('/chat/history', { params }),
    deleteConversation: (id) => apiClient.delete(`/chat/conversation/${id}`),
    clearHistory: () => apiClient.delete('/chat/history'),
  },

  // Voice chat endpoints
  voiceChat: {
    createSession: () => apiClient.post('/voice-chat/session'),
    endSession: (sessionId) => apiClient.post(`/voice-chat/session/${sessionId}/end`),
    getSessionDetails: (sessionId) => apiClient.get(`/voice-chat/session/${sessionId}`),
    getUsageStats: () => apiClient.get('/voice-chat/usage'),
  },

  // Shadow work endpoints
  shadowWork: {
    startJourney: () => apiClient.post('/shadow-work/journey'),
    saveProgress: (data) => apiClient.post('/shadow-work/progress', data),
    getProgress: () => apiClient.get('/shadow-work/progress'),
    getInsights: () => apiClient.get('/shadow-work/insights'),
    completeSection: (sectionId, data) => apiClient.post(`/shadow-work/section/${sectionId}/complete`, data),
  },

  // Admin endpoints
  admin: {
    getUsers: (params) => apiClient.get('/admin/users', { params }),
    updateUser: (userId, data) => apiClient.put(`/admin/users/${userId}`, data),
    deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
    getAnalytics: (params) => apiClient.get('/admin/analytics', { params }),
    getConversations: (params) => apiClient.get('/admin/conversations', { params }),
    getPrompts: () => apiClient.get('/admin/prompts'),
    updatePrompt: (promptId, data) => apiClient.put(`/admin/prompts/${promptId}`, data),
    createPrompt: (data) => apiClient.post('/admin/prompts', data),
    deletePrompt: (promptId) => apiClient.delete(`/admin/prompts/${promptId}`),
    exportAnalytics: (format) => apiClient.get(`/admin/analytics/export?format=${format}`),
  },

  // AI Provider endpoints
  aiProviders: {
    getAll: () => apiClient.get('/ai-providers'),
    getById: (id) => apiClient.get(`/ai-providers/${id}`),
    create: (data) => apiClient.post('/ai-providers', data),
    update: (id, data) => apiClient.put(`/ai-providers/${id}`, data),
    delete: (id) => apiClient.delete(`/ai-providers/${id}`),
    test: (id) => apiClient.post(`/ai-providers/${id}/test`),
    setDefault: (id) => apiClient.post(`/ai-providers/${id}/set-default`),
  },

  // Subscription endpoints
  subscription: {
    getCurrent: () => apiClient.get('/subscription/current'),
    getPlans: () => apiClient.get('/subscription/plans'),
    createCheckoutSession: (planId) => apiClient.post('/subscription/checkout', { planId }),
    cancelSubscription: () => apiClient.post('/subscription/cancel'),
    getUsage: () => apiClient.get('/subscription/usage'),
  },

  // Emotion endpoints
  emotion: {
    analyze: (text) => apiClient.post('/emotion/analyze', { text }),
  },

  // Utility endpoints
  utils: {
    uploadFile: (file, type = 'image') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    getSystemStatus: () => apiClient.get('/health'),
  }
};

// Error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { error: data.message || 'Invalid request', code: 'BAD_REQUEST' };
      case 401:
        return { error: 'Please login to continue', code: 'UNAUTHORIZED' };
      case 403:
        return { error: 'You don\'t have permission to perform this action', code: 'FORBIDDEN' };
      case 404:
        return { error: 'Resource not found', code: 'NOT_FOUND' };
      case 429:
        return { error: 'Too many requests. Please try again later', code: 'RATE_LIMITED' };
      case 500:
        return { error: 'Server error. Please try again later', code: 'SERVER_ERROR' };
      default:
        return { error: data.message || 'An unexpected error occurred', code: 'UNKNOWN' };
    }
  } else if (error.request) {
    // Request made but no response
    return { error: 'Network error. Please check your connection', code: 'NETWORK_ERROR' };
  } else {
    // Error in request setup
    return { error: error.message || 'An unexpected error occurred', code: 'REQUEST_ERROR' };
  }
};

// Request retry logic
export const retryRequest = async (requestFn, retries = 3, delay = 1000) => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries === 0 || error.response?.status < 500) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(requestFn, retries - 1, delay * 2);
  }
};

export default apiClient;