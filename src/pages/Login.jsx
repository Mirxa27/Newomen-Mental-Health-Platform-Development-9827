import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight,
  FiUser 
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Mock login - in production, this would call your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if this is the admin email
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || '';
      const isAdmin = formData.email === adminEmail;
      
      const userData = {
        id: '1',
        name: formData.email.split('@')[0],
        email: formData.email,
        role: isAdmin ? 'admin' : 'user',
        preferences: {
          language: 'en',
          culturalContext: 'mena',
        },
      };
      
      login(userData);
      
      if (isAdmin) {
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      } else {
        toast.success('Welcome back!');
        navigate('/chat');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-gradient-bg" />
      
      {/* Liquid Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-tr from-secondary-400/30 to-accent-400/30 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-md w-full"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-6 group">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center relative overflow-hidden">
                <span className="text-white font-bold text-2xl z-10">N</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-primary-400 to-secondary-400"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{ opacity: 0.5 }}
                />
              </div>
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </Link>
          
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-mobile-title font-bold mb-2"
          >
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {t('welcome')} Back
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600"
          >
            Continue your journey of self-discovery
          </motion.p>
        </div>

        {/* Admin Login Hint - Glassmorphic */}
        {import.meta.env.VITE_ADMIN_EMAIL && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 glass p-4 rounded-2xl border border-blue-200/30"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <FiUser className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-700 font-medium">
                  Admin Demo Access
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Email: {import.meta.env.VITE_ADMIN_EMAIL}
                </p>
                <p className="text-xs text-blue-600">
                  Password: Use any password
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Login Form - Glassmorphic */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="glass-card backdrop-blur-2xl rounded-glass-lg p-8 space-y-6"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('email')}
            </label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="glass-input w-full pl-12 pr-4 py-4"
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('password')}
            </label>
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className="glass-input w-full pl-12 pr-12 py-4"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <Link 
              to="/auth/forgot-password" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              {t('forgotPassword')}
            </Link>
          </div>
          
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-button-primary w-full py-4 text-lg font-semibold flex items-center justify-center space-x-2 group"
          >
            <span>{isLoading ? 'Signing in...' : t('login')}</span>
            {!isLoading && (
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            )}
          </motion.button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-gray-500">Or</span>
            </div>
          </div>
          
          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link 
              to="/auth/register" 
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              {t('register')}
            </Link>
          </div>
        </motion.form>

        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 liquid-blob opacity-20" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 liquid-blob opacity-20" style={{ animationDelay: '2s' }} />
      </motion.div>
    </div>
  );
};

export default Login;