import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventHandlers = new Map();
  }

  connect(token) {
    if (this.socket && this.socket.connected) {
      return;
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    
    this.socket = io(serverUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Connected to server');
      
      // Call connected event handlers
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Disconnected from server:', reason);
      
      // Call disconnected event handlers
      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Unable to connect to server. Please check your internet connection.');
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Connection error');
    });

    // Set up default event handlers
    this.setupDefaultHandlers();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  setupDefaultHandlers() {
    // Handle notifications
    this.socket.on('notification', (notification) => {
      this.emit('notification', notification);
      
      // Show toast notification
      if (notification.type === 'CRISIS_ALERT') {
        toast.error(notification.message);
      } else if (notification.type === 'SYSTEM') {
        toast.success(notification.message);
      } else {
        toast(notification.message);
      }
    });

    // Handle typing indicators
    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket.on('user_stopped_typing', (data) => {
      this.emit('user_stopped_typing', data);
    });

    // Handle conversation events
    this.socket.on('user_joined_conversation', (data) => {
      this.emit('user_joined_conversation', data);
    });

    this.socket.on('user_left_conversation', (data) => {
      this.emit('user_left_conversation', data);
    });

    // Handle voice session events
    this.socket.on('voice_session_started', (data) => {
      this.emit('voice_session_started', data);
    });

    this.socket.on('voice_session_ended', (data) => {
      this.emit('voice_session_ended', data);
    });

    // Handle crisis alerts
    this.socket.on('crisis_alert', (data) => {
      this.emit('crisis_alert', data);
      toast.error(`Crisis alert: User needs immediate attention (Severity: ${data.severity})`);
    });

    // Handle message read status
    this.socket.on('message_read', (data) => {
      this.emit('message_read', data);
    });
  }

  // Event emitter methods
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  // Typing indicators
  startTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { conversationId });
    }
  }

  stopTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stop_typing', { conversationId });
    }
  }

  // Conversation management
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  // Message read status
  markMessageAsRead(messageId, conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message_read', { messageId, conversationId });
    }
  }

  // Voice session events
  startVoiceSession(sessionId, conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('voice_session_start', { sessionId, conversationId });
    }
  }

  endVoiceSession(sessionId, conversationId, duration) {
    if (this.socket && this.isConnected) {
      this.socket.emit('voice_session_end', { sessionId, conversationId, duration });
    }
  }

  // User activity
  updateActivity() {
    if (this.socket && this.isConnected) {
      this.socket.emit('user_activity', { timestamp: Date.now() });
    }
  }

  // Crisis alerts
  sendCrisisAlert(alertId, severity) {
    if (this.socket && this.isConnected) {
      this.socket.emit('crisis_alert', { alertId, severity });
    }
  }

  // Utility methods
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null
    };
  }

  // Activity tracking
  startActivityTracking() {
    // Update activity every 5 minutes
    this.activityInterval = setInterval(() => {
      this.updateActivity();
    }, 5 * 60 * 1000);

    // Also track user interactions
    const events = ['click', 'keypress', 'mousemove', 'scroll'];
    const throttledUpdate = this.throttle(() => {
      this.updateActivity();
    }, 30000);
    
    this.throttledActivityUpdate = throttledUpdate;
    
    events.forEach(event => {
      document.addEventListener(event, throttledUpdate);
    });
  }

  stopActivityTracking() {
    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }

    const events = ['click', 'keypress', 'mousemove', 'scroll'];
    events.forEach(event => {
      document.removeEventListener(event, this.throttledActivityUpdate);
    });
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Cleanup
  cleanup() {
    this.stopActivityTracking();
    this.disconnect();
    this.eventHandlers.clear();
  }
}

export default new SocketService();