import { useState, useEffect, useCallback } from 'react';

export const useNativeFeatures = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
  });

  useEffect(() => {
    // Detect device and browser information
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);
    const isMobile = /Mobi|Android/i.test(userAgent) || isIOS;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isChrome = /chrome/i.test(userAgent) && /google inc/i.test(navigator.vendor);

    setDeviceInfo({
      isMobile,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
    });

    // Check if app is running in standalone mode (PWA)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                     window.navigator.standalone ||
                     document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      }
    };

    // Listen for successful PWA installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log('PWA was installed');
    };

    // Safely add event listeners
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, []);

  const installPWA = useCallback(async () => {
    if (!deferredPrompt || typeof deferredPrompt.prompt !== 'function') return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
    
    return false;
  }, [deferredPrompt]);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'not-supported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  const sendNotification = useCallback((title, options = {}) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
    return null;
  }, []);

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        const wakeLock = await navigator.wakeLock.request('screen');
        console.log('Screen wake lock is active');
        return wakeLock;
      } catch (err) {
        console.error('Failed to acquire wake lock:', err);
        return null;
      }
    }
    return null;
  }, []);

  const vibrate = useCallback((pattern) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const shareContent = useCallback(async (data) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (err) {
        console.error('Error sharing:', err);
        return false;
      }
    }
    return false;
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
      }
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }, []);

  const requestFullscreen = useCallback(() => {
    const element = document.documentElement;
    
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }, []);

  const getNetworkInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    return null;
  }, []);

  return {
    isInstallable,
    isStandalone,
    deviceInfo,
    installPWA,
    requestNotificationPermission,
    sendNotification,
    requestWakeLock,
    vibrate,
    shareContent,
    copyToClipboard,
    requestFullscreen,
    exitFullscreen,
    getNetworkInfo,
  };
};