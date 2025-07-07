import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { PushNotifications } from '@capacitor/push-notifications';

class CapacitorBridge {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.platform = Capacitor.getPlatform();
    this.init();
  }

  async init() {
    if (!this.isNative) return;

    try {
      // Initialize status bar
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#667eea' });

      // Handle app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active:', isActive);
      });

      // Handle back button on Android
      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });

      // Handle keyboard events
      Keyboard.addListener('keyboardWillShow', info => {
        document.body.style.transform = `translateY(-${info.keyboardHeight / 4}px)`;
      });

      Keyboard.addListener('keyboardWillHide', () => {
        document.body.style.transform = 'translateY(0px)';
      });

      // Get device info
      const deviceInfo = await Device.getInfo();
      console.log('Device info:', deviceInfo);

      // Monitor network status
      Network.addListener('networkStatusChange', status => {
        console.log('Network status changed:', status);
        // You can dispatch events here to update your app state
        window.dispatchEvent(new CustomEvent('networkchange', { detail: status }));
      });

    } catch (error) {
      console.error('Error initializing Capacitor:', error);
    }
  }

  // Haptic feedback
  async hapticImpact(style = ImpactStyle.Medium) {
    if (!this.isNative) return;
    
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async hapticVibrate(duration = 100) {
    if (!this.isNative) return;
    
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('Haptic vibration error:', error);
    }
  }

  // Share functionality
  async share(options) {
    if (!this.isNative) {
      // Fallback to Web Share API
      if (navigator.share) {
        return await navigator.share(options);
      }
      return false;
    }

    try {
      await Share.share(options);
      return true;
    } catch (error) {
      console.error('Share error:', error);
      return false;
    }
  }

  // Clipboard
  async copyToClipboard(text) {
    if (!this.isNative) {
      // Fallback to web clipboard
      if (navigator.clipboard) {
        return await navigator.clipboard.writeText(text);
      }
      return false;
    }

    try {
      await Clipboard.write({ string: text });
      return true;
    } catch (error) {
      console.error('Clipboard error:', error);
      return false;
    }
  }

  async getFromClipboard() {
    if (!this.isNative) {
      if (navigator.clipboard) {
        return await navigator.clipboard.readText();
      }
      return '';
    }

    try {
      const result = await Clipboard.read();
      return result.value || '';
    } catch (error) {
      console.error('Clipboard read error:', error);
      return '';
    }
  }

  // Push notifications
  async requestNotificationPermissions() {
    if (!this.isNative) return false;

    try {
      const result = await PushNotifications.requestPermissions();
      return result.receive === 'granted';
    } catch (error) {
      console.error('Push notification permission error:', error);
      return false;
    }
  }

  async registerForPushNotifications() {
    if (!this.isNative) return;

    try {
      await PushNotifications.register();
      
      PushNotifications.addListener('registration', token => {
        console.log('Push registration success, token: ' + token.value);
        // Send token to your server
      });

      PushNotifications.addListener('registrationError', err => {
        console.error('Registration error: ', err.error);
      });

      PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push notification received: ', notification);
        // Handle received notification
      });

      PushNotifications.addListener('pushNotificationActionPerformed', notification => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
        // Handle notification action
      });

    } catch (error) {
      console.error('Push notification registration error:', error);
    }
  }

  // Network status
  async getNetworkStatus() {
    if (!this.isNative) {
      return {
        connected: navigator.onLine,
        connectionType: 'unknown'
      };
    }

    try {
      const status = await Network.getStatus();
      return status;
    } catch (error) {
      console.error('Network status error:', error);
      return { connected: false, connectionType: 'unknown' };
    }
  }

  // Device info
  async getDeviceInfo() {
    if (!this.isNative) {
      return {
        platform: 'web',
        model: 'Unknown',
        osVersion: 'Unknown'
      };
    }

    try {
      const info = await Device.getInfo();
      return info;
    } catch (error) {
      console.error('Device info error:', error);
      return null;
    }
  }

  // App info
  async getAppInfo() {
    if (!this.isNative) return null;

    try {
      const info = await App.getInfo();
      return info;
    } catch (error) {
      console.error('App info error:', error);
      return null;
    }
  }

  // Status bar
  async setStatusBarStyle(style) {
    if (!this.isNative) return;

    try {
      await StatusBar.setStyle({ style });
    } catch (error) {
      console.error('Status bar style error:', error);
    }
  }

  async hideStatusBar() {
    if (!this.isNative) return;

    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Hide status bar error:', error);
    }
  }

  async showStatusBar() {
    if (!this.isNative) return;

    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Show status bar error:', error);
    }
  }

  // Keyboard
  async hideKeyboard() {
    if (!this.isNative) return;

    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Hide keyboard error:', error);
    }
  }

  async showKeyboard() {
    if (!this.isNative) return;

    try {
      await Keyboard.show();
    } catch (error) {
      console.error('Show keyboard error:', error);
    }
  }
}

// Create singleton instance
const capacitorBridge = new CapacitorBridge();

export default capacitorBridge;
export { CapacitorBridge };