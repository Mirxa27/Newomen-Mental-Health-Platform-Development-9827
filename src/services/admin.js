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

// Get dashboard statistics
export const getDashboardStats = async () => {
  return makeAuthenticatedRequest('/admin/dashboard/stats');
};

// Get all users with pagination
export const getUsers = async (page = 1, limit = 10) => {
  return makeAuthenticatedRequest(`/admin/users?page=${page}&limit=${limit}`);
};

// Get a specific user
export const getUser = async (userId) => {
  return makeAuthenticatedRequest(`/admin/users/${userId}`);
};

// Update user role
export const updateUserRole = async (userId, role) => {
  return makeAuthenticatedRequest(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
};

// Delete user
export const deleteUser = async (userId) => {
  return makeAuthenticatedRequest(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
};

// Get all conversations with pagination
export const getConversations = async (page = 1, limit = 10) => {
  return makeAuthenticatedRequest(`/admin/conversations?page=${page}&limit=${limit}`);
};

// Get conversation messages
export const getConversationMessages = async (conversationId) => {
  return makeAuthenticatedRequest(`/admin/conversations/${conversationId}/messages`);
};

// Get system analytics
export const getAnalytics = async () => {
  return makeAuthenticatedRequest('/admin/analytics');
};

// Get system settings
export const getSettings = async () => {
  return makeAuthenticatedRequest('/admin/settings');
};