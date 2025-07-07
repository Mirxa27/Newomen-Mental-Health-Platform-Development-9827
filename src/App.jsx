import React, { useEffect } from 'react';
import { Routes, Route, useRoutes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useCapacitor } from './hooks/useCapacitor';
import ErrorBoundary from './components/common/ErrorBoundary';
import routes from './router';
import './App.css';

function App() {
  const location = useLocation();
  const element = useRoutes(routes);
  const { isNative, hapticFeedback, deviceInfo } = useCapacitor();

  useEffect(() => {
    // Add haptic feedback to buttons and interactive elements
    if (isNative) {
      const addHapticToButtons = () => {
        const buttons = document.querySelectorAll('button, [role="button"], .touch-target');
        buttons.forEach(button => {
          button.addEventListener('click', () => {
            hapticFeedback();
          });
        });
      };

      // Add haptic feedback after a short delay to ensure DOM is ready
      setTimeout(addHapticToButtons, 100);

      // Re-add haptic feedback when route changes
      const timeoutId = setTimeout(addHapticToButtons, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, isNative, hapticFeedback]);

  useEffect(() => {
    // Set viewport height for mobile devices
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  useEffect(() => {
    // Prevent default behaviors that might interfere with the app
    const preventDefault = (e) => {
      // Prevent pull-to-refresh on mobile
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventZoom = (e) => {
      // Prevent pinch-to-zoom
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchmove', preventZoom);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="app" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {element}
          </motion.div>
        </AnimatePresence>
        
        <Toaster
          position={isNative && deviceInfo?.platform === 'ios' ? 'top-center' : 'top-center'}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              maxWidth: '90vw',
              wordBreak: 'break-word',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;