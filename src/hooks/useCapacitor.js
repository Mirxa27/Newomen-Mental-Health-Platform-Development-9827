import { useState, useEffect, useCallback } from 'react';
import capacitorBridge from '../utils/capacitorBridge';
import { ImpactStyle } from '@capacitor/haptics';

export const useCapacitor = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState('web');
  const [networkStatus, setNetworkStatus] = useState({
    connected: true,
    connectionType: 'unknown'
  });
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    setIsNative(capacitorBridge.isNative);
    setPlatform(capacitorBridge.platform);

    // Get initial device and network info
    const initializeInfo = async () => {
      const [deviceInfo, networkStatus] = await Promise.all([
        capacitorBridge.getDeviceInfo(),
        capacitorBridge.getNetworkStatus()
      ]);
      
      setDeviceInfo(deviceInfo);
      setNetworkStatus(networkStatus);
    };

    initializeInfo();

    // Listen for network changes
    const handleNetworkChange = (event) => {
      setNetworkStatus(event.detail);
    };

    window.addEventListener('networkchange', handleNetworkChange);

    return () => {
      window.removeEventListener('networkchange', handleNetworkChange);
    };
  }, []);

  const hapticFeedback = useCallback(async (style = ImpactStyle.Medium) => {
    await capacitorBridge.hapticImpact(style);
  }, []);

  const vibrate = useCallback(async (duration = 100) => {
    await capacitorBridge.hapticVibrate(duration);
  }, []);

  const share = useCallback(async (options) => {
    return await capacitorBridge.share(options);
  }, []);

  const copyToClipboard = useCallback(async (text) => {
    return await capacitorBridge.copyToClipboard(text);
  }, []);

  const getFromClipboard = useCallback(async () => {
    return await capacitorBridge.getFromClipboard();
  }, []);

  const requestNotificationPermissions = useCallback(async () => {
    return await capacitorBridge.requestNotificationPermissions();
  }, []);

  const registerForPushNotifications = useCallback(async () => {
    await capacitorBridge.registerForPushNotifications();
  }, []);

  const hideKeyboard = useCallback(async () => {
    await capacitorBridge.hideKeyboard();
  }, []);

  const showKeyboard = useCallback(async () => {
    await capacitorBridge.showKeyboard();
  }, []);

  const setStatusBarStyle = useCallback(async (style) => {
    await capacitorBridge.setStatusBarStyle(style);
  }, []);

  return {
    isNative,
    platform,
    networkStatus,
    deviceInfo,
    hapticFeedback,
    vibrate,
    share,
    copyToClipboard,
    getFromClipboard,
    requestNotificationPermissions,
    registerForPushNotifications,
    hideKeyboard,
    showKeyboard,
    setStatusBarStyle,
  };
};