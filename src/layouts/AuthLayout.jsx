import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../store/authStore';

const AuthLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Set page title based on current auth route
  useEffect(() => {
    const path = location.pathname;
    let title = 'Login - Newomen';
    
    if (path === '/auth/register') title = 'Register - Newomen';
    else if (path === '/auth/forgot-password') title = 'Forgot Password - Newomen';
    
    document.title = title;
  }, [location]);

  return (
    <>
      <Helmet>
        <title>{document.title}</title>
        <meta name="description" content="Access your Newomen account to continue your journey of self-discovery and growth." />
      </Helmet>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50"
      >
        <Outlet />
      </motion.div>
    </>
  );
};

export default AuthLayout;