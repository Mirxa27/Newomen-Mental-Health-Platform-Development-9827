import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function register({ name, email, password }) {
  const { data } = await axios.post(`${API_BASE}/auth/register`, { name, email, password }, { withCredentials: true });
  return data.user;
}

export async function login({ email, password }) {
  const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password }, { withCredentials: true });
  return data.user;
}

export async function logout() {
  // optional endpoint; for now we just clear cookies on server or rely on front-end store
  await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true }).catch(() => {});
}