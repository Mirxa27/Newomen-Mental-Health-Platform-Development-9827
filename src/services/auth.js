import apiClient from '../utils/api';

export async function register({ name, email, password }) {
  try {
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }
    
    const { data } = await apiClient.post('/auth/register', { name, email, password });
    
    if (!data || !data.user) {
      throw new Error('Invalid response from server');
    }
    
    return data.user;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
}

export async function login({ email, password }) {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    const { data } = await apiClient.post('/auth/login', { email, password });
    
    if (!data || !data.user) {
      throw new Error('Invalid response from server');
    }
    
    return data.user;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Login failed. Please check your credentials.');
  }
}

export async function logout() {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Logout errors are typically not critical, but we should still handle them gracefully
    throw new Error('Logout failed. Please try again.');
  }
}