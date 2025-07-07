import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';
import MobileNavigation from '../components/navigation/MobileNavigation';
import { useAuthStore } from '../store/authStore';
import { useMediaQuery } from '../hooks/useMediaQuery';

const MainLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [pageTitle, setPageTitle] = useState('Newomen');
  
  // Determine page title based on route
  useEffect(() => {
    const path = location.pathname;
    let title = 'Newomen - Your Journey to Authentic Self';
    
    if (path === '/') title = 'Newomen - Your Journey to Authentic Self';
    else if (path === '/chat') title = 'AI Companion Chat - Newomen';
    else if (path === '/shadow-work') title = 'Shadow Work Journey - Newomen';
    else if (path === '/profile') title = 'Your Profile - Newomen';
    else if (path === '/subscription') title = 'Subscription Plans - Newomen';
    
    setPageTitle(title);
    document.title = title;
  }, [location]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="AI-powered platform for women's mental health and personal growth through culturally-sensitive conversations and shadow work." />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content="AI-powered platform for women's mental health and personal growth." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://newomen.com${location.pathname}`} />
      </Helmet>
    
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Navbar />
        
        <div className="flex">
          {isAuthenticated && !isMobile && <Sidebar />}
          
          <main className={`flex-1 transition-all duration-300 pb-20 md:pb-0 ${isAuthenticated && !isMobile ? 'md:ml-64' : ''}`}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-screen"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
        
        {isMobile && isAuthenticated && <MobileNavigation />}
      </div>
    </>
  );
};

export default MainLayout;