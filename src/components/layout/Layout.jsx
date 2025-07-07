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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar />
      <div className="flex">
        {isAuthenticated && !isMobile && <Sidebar />}
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
      {isAuthenticated && isMobile && <MobileNavigation />}
    </div>
  );
};

export default Layout;