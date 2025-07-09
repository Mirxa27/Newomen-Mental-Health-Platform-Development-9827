import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, matchPath } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import StickyNavbar from '../components/navigation/StickyNavbar';
import RoleBasedMobileFooter from '../components/navigation/RoleBasedMobileFooter';
import Breadcrumb from '../components/navigation/Breadcrumb';
import Footer from '../components/layout/Footer';
import PWAInstallPrompt from '../components/common/PWAInstallPrompt';
import NetworkStatus from '../components/common/NetworkStatus';
import { useAuthStore } from '../store/authStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { routes } from '../router';

const MainLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [pageTitle, setPageTitle] = useState('Newomen');

  // Determine page title based on route metadata
  useEffect(() => {
    const path = location.pathname;
    let title = 'Newomen - Your Journey to Authentic Self';

    // Recursive function to find matching route metadata
    const findMeta = (routeList) => {
      if (!Array.isArray(routeList)) return null;
      for (const route of routeList) {
        // Check for a direct match with metadata
        if (route.path && matchPath({ path: route.path, end: route.path === '/' }, path) && route.meta) {
          return route.meta;
        }
        // Recurse into children if they exist
        if (route.children) {
          const childMeta = findMeta(route.children);
          if (childMeta) return childMeta;
        }
      }
      return null;
    };

    let meta = null;
    try {
      meta = findMeta(routes);
    } catch (e) {
      meta = null;
    }
    if (meta?.title) {
      title = `${meta.title} - Newomen`;
    }

    // Handle dynamic titles for specific routes, like shadow work questions
    if (path.startsWith('/shadow-work/')) {
      const questionNumber = path.split('/')[2];
      if (questionNumber && !isNaN(parseInt(questionNumber))) {
        title = `Shadow Work Question ${questionNumber} - Newomen`;
      } else {
        title = 'Shadow Work Journey - Newomen';
      }
    }

    setPageTitle(title);
    // Note: react-helmet-async handles the document.title update
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="AI-powered platform for women's mental health and personal growth through culturally-sensitive conversations and shadow work." />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content="AI-powered platform for women's mental health and personal growth." />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#111827" /> {/* Dark theme color */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Newomen" />
        <link rel="canonical" href={`https://newomen.com${location.pathname}`} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-900 text-gray-200 relative overflow-x-hidden">
        {/* Background Effects: Positioned behind all content */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 animated-gradient-bg" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl animate-liquid-blob" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary-500/20 rounded-full filter blur-3xl animate-liquid-blob animation-delay-4000" />
          <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl animate-liquid-blob animation-delay-2000" />
        </div>
        
        <Navbar />
        <StickyNavbar />
        
        {/* Content Container: Positioned above the background */}
        <div className="relative z-10 flex min-h-screen">
          <NetworkStatus />
          
          {isAuthenticated && !isMobile && <Sidebar />}
          
          <main 
            className={`flex-1 transition-all duration-300 pt-20 ${isAuthenticated && !isMobile ? 'ml-64' : ''}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Breadcrumb Navigation */}
              {isAuthenticated && (
                <div className="py-4">
                  <Breadcrumb />
                </div>
              )}
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex-grow w-full pb-32 md:pb-8"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
            
            {!isMobile && <Footer />}
          </main>
        </div>
        
        <RoleBasedMobileFooter />

        {/* Mobile-specific UI elements, also on top layer */}
        <div className="relative z-20">
          <PWAInstallPrompt />
        </div>
      </div>
    </>
  );
};

export default MainLayout;