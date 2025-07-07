import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './SafeIcon';

const { FiWifiOff, FiWifi } = FiIcons;

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineNotice(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showOfflineNotice && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-16 left-4 right-4 z-50 md:left-6 md:right-auto md:max-w-sm"
        >
          <div className="bg-red-500 text-white rounded-lg px-4 py-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiWifiOff} className="w-5 h-5" />
              <div>
                <p className="font-medium">You're offline</p>
                <p className="text-sm opacity-90">Some features may not work</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {isOnline && showOfflineNotice && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-16 left-4 right-4 z-50 md:left-6 md:right-auto md:max-w-sm"
        >
          <div className="bg-green-500 text-white rounded-lg px-4 py-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiWifi} className="w-5 h-5" />
              <div>
                <p className="font-medium">You're back online</p>
                <p className="text-sm opacity-90">All features restored</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatus;