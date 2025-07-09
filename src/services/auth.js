import apiClient from '../utils/api';

export async function register({ name, email, password }) {
  const { data } = await apiClient.post('/auth/register', { name, email, password });
  return data.user;
}

export async function login({ email, password }) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data.user;
}

export async function logout() {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Ignore logout errors
    console.warn('Logout error:', error);
  }
}