import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './SafeIcon';
import { useNativeFeatures } from '../../hooks/useNativeFeatures';

const { FiDownload, FiX, FiSmartphone, FiShare, FiPlus, FiZap, FiHeart } = FiIcons;

const PWAInstallPrompt = () => {
  const { isInstallable, deviceInfo, installPWA } = useNativeFeatures();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    try {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = localStorage.getItem('pwa-install-dismissed-time');
      
      if (dismissed && dismissedTime) {
        const dismissedDate = new Date(dismissedTime);
        const now = new Date();
        const daysSinceDismissed = (now - dismissedDate) / (1000 * 60 * 60 * 24);
        
        // Show again after 7 days
        if (daysSinceDismissed < 7) {
          setIsDismissed(true);
          return;
        } else {
          // Reset dismissal after 7 days
          localStorage.removeItem('pwa-install-dismissed');
          localStorage.removeItem('pwa-install-dismissed-time');
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }

    // Show prompt after user interaction and delay if installable
    if (isInstallable && !isDismissed) {
      // Wait for user to interact with the page first
      const handleUserInteraction = () => {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // Show after 3 seconds of interaction

        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('scroll', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        
        return () => clearTimeout(timer);
      };

      document.addEventListener('click', handleUserInteraction, { once: true });
      document.addEventListener('scroll', handleUserInteraction, { once: true });
      document.addEventListener('keydown', handleUserInteraction, { once: true });

      return () => {
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('scroll', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      };
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
      localStorage.setItem('pwa-install-dismissed-time', new Date().toISOString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const renderIOSInstructions = () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 mb-3">To install this app on your iPhone:</p>
      </div>
      
      {/* Visual step-by-step guide */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            1
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              Tap the <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-sm text-xs mx-1">
                <SafeIcon icon={FiShare} className="w-3 h-3" />
              </span> share button in Safari
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            2
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              Scroll down and tap <span className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 rounded text-xs font-semibold text-purple-800">
                <SafeIcon icon={FiPlus} className="w-3 h-3" />
                <span>"Add to Home Screen"</span>
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
          <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            3
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              Tap <span className="inline-block px-2 py-1 bg-pink-100 rounded text-xs font-semibold text-pink-800">"Add"</span> to install the app
            </p>
          </div>
        </div>
      </div>
      
      {/* Benefits highlight */}
      <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <div className="flex items-center space-x-2 mb-2">
          <SafeIcon icon={FiHeart} className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">You'll get:</span>
        </div>
        <ul className="text-xs text-green-700 space-y-1 ml-6">
          <li>• Faster loading times</li>
          <li>• Offline access to features</li>
          <li>• Push notifications</li>
          <li>• Native app experience</li>
        </ul>
      </div>
    </div>
  );

  if (!showPrompt || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-md z-50"
      >
        {/* Glassmorphic container */}
        <div className="relative overflow-hidden">
          {/* Background with glassmorphic effect */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl"></div>
          
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-blue-400/10 rounded-3xl"></div>
          
          {/* Floating particles */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-6 left-6 w-1 h-1 bg-pink-400/40 rounded-full animate-pulse delay-1000"></div>
          
          {/* Content */}
          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                {/* App icon with gradient */}
                <div className="relative">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg"
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, 0, -2, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    >
                      <SafeIcon icon={FiZap} className="w-6 h-6 text-white" />
                    </motion.div>
                  </motion.div>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30 -z-10"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Install Newomen
                  </h3>
                  <p className="text-sm text-gray-600">Get the full app experience</p>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all duration-200"
                aria-label="Dismiss"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>

            {/* Content based on device */}
            {deviceInfo.isIOS ? (
              renderIOSInstructions()
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 leading-relaxed">
                  Install Newomen for a better experience with offline support, push notifications, and native feel.
                </div>
                
                {/* Benefits for non-iOS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="text-xs font-medium text-blue-800 mb-1">Offline Access</div>
                    <div className="text-xs text-blue-600">Use app without internet</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="text-xs font-medium text-purple-800 mb-1">Faster Loading</div>
                    <div className="text-xs text-purple-600">Instant app startup</div>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-3 mt-6">
              {!deviceInfo.isIOS && (
                <motion.button
                  onClick={handleInstall}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <SafeIcon icon={FiDownload} className="w-4 h-4" />
                  <span>Install App</span>
                </motion.button>
              )}
              <button
                onClick={handleDismiss}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl transition-all duration-200 text-sm font-medium"
              >
                {deviceInfo.isIOS ? 'Maybe Later' : 'Not Now'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;