import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, matchPath } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';
import MobileNavigation from '../components/navigation/MobileNavigation';
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
      </Helmet>
      
      <div className="min-h-screen bg-gray-900 text-gray-200 relative overflow-x-hidden">
        {/* Background Effects: Positioned behind all content */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 animated-gradient-bg" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl animate-liquid-blob" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary-500/20 rounded-full filter blur-3xl animate-liquid-blob animation-delay-4000" />
          <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl animate-liquid-blob animation-delay-2000" />
        </div>
        
        {/* Content Container: Positioned above the background */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <NetworkStatus />
          
          <div className="flex flex-1">
            {isAuthenticated && !isMobile && <Sidebar />}
            
            <main 
              className={`flex-1 transition-all duration-300 ${
                isAuthenticated && !isMobile ? 'md:ml-64' : ''
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  // Ensure content area fills available space and has padding
                  className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 pb-28 md:pb-8"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
          
          {/* Footer is shown only on desktop for a cleaner mobile experience */}
          {!isMobile && <Footer />}
        </div>

        {/* Mobile-specific UI elements, also on top layer */}
        <div className="relative z-20">
          {isMobile && isAuthenticated && <MobileNavigation />}
          <PWAInstallPrompt />
        </div>
      </div>

      {/* Self-contained global styles for animations. No need for external CSS files. */}
      <style jsx global>{`
        @keyframes animated-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-gradient-bg {
          background: linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #4f46e5);
          background-size: 400% 400%;
          animation: animated-gradient 25s ease infinite;
        }

        @keyframes liquid-blob-animation {
          0% { transform: scale(1) translate(0px, 0px) rotate(0deg); }
          25% { transform: scale(1.1) translate(20px, -30px) rotate(90deg); }
          50% { transform: scale(0.9) translate(-30px, 20px) rotate(180deg); }
          75% { transform: scale(1.2) translate(-10px, 30px) rotate(270deg); }
          100% { transform: scale(1) translate(0px, 0px) rotate(360deg); }
        }
        .animate-liquid-blob {
          animation: liquid-blob-animation 30s infinite ease-in-out alternate;
        }
        .animation-delay-2000 { animation-delay: -15s; }
        .animation-delay-4000 { animation-delay: -7s; }
      `}</style>
    </>
  );
};

export default MainLayout;