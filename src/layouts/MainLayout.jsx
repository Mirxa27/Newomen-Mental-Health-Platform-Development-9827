import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';
import MobileNavigation from '../components/navigation/MobileNavigation';
import PWAInstallPrompt from '../components/common/PWAInstallPrompt';
import NetworkStatus from '../components/common/NetworkStatus';
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Newomen" />
        <link rel="canonical" href={`https://newomen.com${location.pathname}`} />
        <link rel="manifest" href="/manifest.json" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Navbar />
        <NetworkStatus />
        
        <div className="flex">
          {isAuthenticated && !isMobile && <Sidebar />}
          
          <main 
            className={`flex-1 transition-all duration-300 pb-20 md:pb-0 ${
              isAuthenticated && !isMobile ? 'md:ml-64' : ''
            }`}
          >
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
        <PWAInstallPrompt />
      </div>
    </>
  );
};

export default MainLayout;