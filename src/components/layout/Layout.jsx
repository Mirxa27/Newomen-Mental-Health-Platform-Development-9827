import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNavigation from '../navigation/MobileNavigation';
import { useAuthStore } from '../../store/authStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const Layout = () => {
  const { isAuthenticated } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Liquid animated background blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-primary-400 to-secondary-400 opacity-30 rounded-full filter blur-3xl animate-blob1" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tr from-secondary-400 to-primary-400 opacity-30 rounded-full filter blur-3xl animate-blob2" />
      </div>
      <Navbar className="glass-effect z-10" />
      <div className="flex relative z-10">
        {isAuthenticated && !isMobile && <Sidebar className="glass-effect" />}
        <main className={`flex-1 transition-all duration-300 ${isAuthenticated && !isMobile ? 'ml-64' : ''} pb-20 md:pb-0`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      {isAuthenticated && isMobile && <MobileNavigation className="glass-effect" />}
    </div>
  );
};

export default Layout;