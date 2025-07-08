const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Make authenticated API request
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || 'Request failed');
  }

  return response.json();
};

// Get all shadow work questions
export const getShadowWorkQuestions = async () => {
  return makeAuthenticatedRequest('/shadowwork/questions');
};

// Get a specific shadow work question
export const getShadowWorkQuestion = async (questionId) => {
  return makeAuthenticatedRequest(`/shadowwork/questions/${questionId}`);
};

// Get user's shadow work sessions
export const getShadowWorkSessions = async () => {
  return makeAuthenticatedRequest('/shadowwork/sessions');
};

// Get a specific shadow work session
export const getShadowWorkSession = async (sessionId) => {
  return makeAuthenticatedRequest(`/shadowwork/sessions/${sessionId}`);
};

// Create or update a shadow work session
export const saveShadowWorkSession = async (questionId, response, insights = '') => {
  return makeAuthenticatedRequest('/shadowwork/sessions', {
    method: 'POST',
    body: JSON.stringify({ questionId, response, insights }),
  });
};

// Generate insights for a shadow work response
export const generateInsights = async (sessionId) => {
  return makeAuthenticatedRequest(`/shadowwork/sessions/${sessionId}/insights`, {
    method: 'POST',
  });
};

// Get user's shadow work progress
export const getShadowWorkProgress = async () => {
  return makeAuthenticatedRequest('/shadowwork/progress');
};