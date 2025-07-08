import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { useAuthStore } from '../store/authStore';

const { FiMail, FiLock, FiEye, FiEyeOff } = FiIcons;

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-200/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-secondary-200/10 rounded-full float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent-200/10 rounded-full float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-primary-200/5 rounded-full animate-float"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-6 md:space-y-8 relative z-10"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base md:text-lg">N</span>
            </div>
            <span className="text-xl md:text-2xl font-bold gradient-text">Newomen</span>
          </Link>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t('welcome')} Back
          </h2>
          
          <p className="text-gray-600">
            Continue your journey of self-discovery
          </p>
          
          {/* Admin Login Hint */}
          {import.meta.env.VITE_ADMIN_EMAIL && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Admin Email:</strong> {import.meta.env.VITE_ADMIN_EMAIL}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Use any password for demo purposes
              </p>
            </div>
          )}
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="liquid-glass rounded-xl md:rounded-2xl p-6 md:p-8 shadow-glass space-y-5 md:space-y-6 relative"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('email')}
            </label>
            <div className="relative">
              <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="glass-input w-full pl-10 pr-4 py-2 md:py-3 rounded-lg transition-all duration-300 text-gray-900 placeholder-gray-500"
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className="glass-input w-full pl-10 pr-12 py-2 md:py-3 rounded-lg transition-all duration-300 text-gray-900 placeholder-gray-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500 transition-colors">
              {t('forgotPassword')}
            </Link>
          </div>
          
          <motion.button
            type="submit"
            disabled={isLoading}
            className="liquid-glass w-full bg-gradient-to-r from-primary-500/80 to-secondary-500/80 text-white py-2 md:py-3 px-4 rounded-lg font-semibold hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-primary-200/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Signing in...' : t('login')}
          </motion.button>
          
          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-primary-600 hover:text-primary-500 font-semibold transition-colors">
              {t('register')}
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Login;