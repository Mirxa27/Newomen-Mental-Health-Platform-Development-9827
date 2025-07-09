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
    <div className="min-h-screen bg-gray-900 text-gray-200 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 animated-gradient-bg" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl animate-liquid-blob" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary-500/20 rounded-full filter blur-3xl animate-liquid-blob animation-delay-4000" />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl animate-liquid-blob animation-delay-2000" />
      </div>
      
      <Navbar />
      
      <div className="flex relative z-10">
        {isAuthenticated && !isMobile && <Sidebar />}
        <main className={`flex-1 transition-all duration-300 pt-20 ${isAuthenticated && !isMobile ? 'ml-64' : ''} pb-32 md:pb-8`}>
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
      
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default Layout;