import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

// Centralized authentication hook
export const useAuth = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();

  // Enhanced login with proper error handling
  const login = async (credentials) => {
    try {
      await authStore.login(credentials);
      showSuccessToast('Welcome back!');
      navigate('/');
    } catch (error) {
      showErrorToast(error.message || 'Login failed. Please try again.');
      throw error;
    }
  };

  // Enhanced logout with confirmation
  const logout = async () => {
    try {
      await authStore.logout();
      showSuccessToast('Logged out successfully');
      navigate('/');
    } catch (error) {
      showErrorToast('Logout failed. Please try again.');
      throw error;
    }
  };

  // Enhanced register with proper error handling
  const register = async (userData) => {
    try {
      await authStore.register(userData);
      showSuccessToast('Account created successfully!');
      navigate('/');
    } catch (error) {
      showErrorToast(error.message || 'Registration failed. Please try again.');
      throw error;
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return authStore.isAdmin();
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return authStore.isAuthenticated;
  };

  // Redirect to login if not authenticated
  const requireAuth = () => {
    if (!isAuthenticated()) {
      navigate('/auth/login');
      return false;
    }
    return true;
  };

  // Redirect to login if not admin
  const requireAdmin = () => {
    if (!isAuthenticated()) {
      navigate('/auth/login');
      return false;
    }
    if (!isAdmin()) {
      navigate('/');
      showErrorToast('Access denied. Admin privileges required.');
      return false;
    }
    return true;
  };

  return {
    // State
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    personalityType: authStore.personalityType,
    crystals: authStore.crystals,
    shadowProgress: authStore.shadowProgress,
    subscription: authStore.subscription,
    
    // Actions
    login,
    logout,
    register,
    updateProfile: authStore.updateProfile,
    setPersonality: authStore.setPersonality,
    addCrystals: authStore.addCrystals,
    updateProgress: authStore.updateProgress,
    updateSubscription: authStore.updateSubscription,
    deductMinutes: authStore.deductMinutes,
    
    // Utilities
    isAdmin,
    requireAuth,
    requireAdmin,
  };
};

export default useAuth;