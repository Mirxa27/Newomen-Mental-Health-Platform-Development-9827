import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './SafeIcon';
import { useNativeFeatures } from '../../hooks/useNativeFeatures';

const { FiDownload, FiX, FiSmartphone, FiShare, FiPlus } = FiIcons;

const PWAInstallPrompt = () => {
  const { isInstallable, deviceInfo, installPWA } = useNativeFeatures();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    try {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        setIsDismissed(true);
        return;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }

    // Show prompt after a delay if installable
    if (isInstallable && !isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isDismissed]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success || !success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    try {
      localStorage.setItem('pwa-install-dismissed', 'true');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const renderIOSInstructions = () => (
    <div className="text-sm text-gray-600 space-y-2">
      <p className="font-medium">To install this app on your iPhone:</p>
      <ol className="list-decimal list-inside space-y-1 text-xs">
        <li>Tap the <SafeIcon icon={FiShare} className="inline w-3 h-3" /> share button in Safari</li>
        <li>Scroll down and tap "Add to Home Screen"</li>
        <li>Tap "Add" to install the app</li>
      </ol>
    </div>
  );

  if (!showPrompt || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-sm z-50"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiSmartphone} className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Install Newomen</h3>
                <p className="text-sm text-gray-600">Get the full app experience</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          {deviceInfo.isIOS ? (
            renderIOSInstructions()
          ) : (
            <div className="text-sm text-gray-600 mb-4">
              Install Newomen for a better experience with offline support, push notifications, and native feel.
            </div>
          )}

          <div className="flex space-x-3 mt-4">
            {!deviceInfo.isIOS && (
              <button
                onClick={handleInstall}
                className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                <span>Install</span>
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
            >
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;