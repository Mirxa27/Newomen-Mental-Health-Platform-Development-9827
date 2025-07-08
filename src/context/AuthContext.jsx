import React, { createContext, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuthStore } from '../store/authStore';
import * as authApi from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const {
    user,
    isAuthenticated,
    login: storeLogin,
    logout: storeLogout,
  } = useAuthStore();

  const login = async (email, password) => {
    const userData = await authApi.login({ email, password });
    storeLogin(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const userData = await authApi.register({ name, email, password });
    storeLogin(userData);
    return userData;
  };

  const logout = () => {
    storeLogout();
    authApi.logout();
  };

  useEffect(() => {
    // Optionally we could attempt to fetch current session from backend here
  }, []);

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);