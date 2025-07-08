import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, matchPath } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';
import MobileNavigation from '../components/navigation/MobileNavigation';
import PWAInstallPrompt from '../components/common/PWAInstallPrompt';
import NetworkStatus from '../components/common/NetworkStatus';
import { useAuthStore } from '../store/authStore';
import { useMediaQuery } from '../hooks/useMediaQuery';
import routes from '../router';

const MainLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [pageTitle, setPageTitle] = useState('Newomen');

  // Determine page title based on route metadata
  useEffect(() => {
    const path = location.pathname;
    let title = 'Newomen - Your Journey to Authentic Self';

    const findMeta = (list) => {
      for (const r of list) {
        if (r.path && matchPath({ path: r.path, end: false }, path) && r.meta) {
          return r.meta;
        }
        if (r.children) {
          const child = findMeta(r.children);
          if (child) return child;
        }
      }
      return null;
    };

    const meta = findMeta(routes);
    if (meta?.title) title = `${meta.title} - Newomen`;

    if (path.startsWith('/shadow-work')) {
      const q = path.split('/')[2];
      title = q ? `Shadow Work Question ${q} - Newomen` : 'Shadow Work Journey - Newomen';
    }

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
      
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="fixed inset-0 animated-gradient-bg" />
        
        {/* Liquid Blob Decorations */}
        <div className="fixed top-0 left-0 w-96 h-96 liquid-blob opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="fixed bottom-0 right-0 w-80 h-80 liquid-blob opacity-20 translate-x-1/2 translate-y-1/2" 
             style={{ animationDelay: '4s' }} />
        <div className="fixed top-1/2 left-1/2 w-64 h-64 liquid-blob opacity-10 -translate-x-1/2 -translate-y-1/2" 
             style={{ animationDelay: '2s' }} />
        
        {/* Content Container */}
        <div className="relative z-10">
          <Navbar />
          <NetworkStatus />
          
          <div className="flex">
            {isAuthenticated && !isMobile && <Sidebar />}
            
            <main 
              className={`flex-1 transition-all duration-300 ${
                isMobile ? 'pb-24' : 'pb-8'
              } ${
                isAuthenticated && !isMobile ? 'md:ml-64' : ''
              }`}
            >
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="min-h-screen"
              >
                <div className="mobile-p-safe md:p-8 max-w-7xl mx-auto">
                  <Outlet />
                </div>
              </motion.div>
            </main>
          </div>
          
          {isMobile && isAuthenticated && <MobileNavigation />}
          <PWAInstallPrompt />
        </div>
      </div>
    </>
  );
};

export default MainLayout;
