import { useEffect, useRef, useState } from 'react';
import socketService from '../services/socketService';
import { useAuthStore } from '../store/authStore';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to socket
      socketService.connect(token);
      
      // Set up connection event handlers
      const handleConnected = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Start activity tracking
        socketService.startActivityTracking();
        
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      const handleDisconnected = (reason) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Stop activity tracking
        socketService.stopActivityTracking();
        
        // Set up reconnection if needed
        if (reason === 'io client disconnect') {
          // Manual disconnect, don't reconnect
          return;
        }
        
        // Automatic reconnection for other disconnect reasons
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isAuthenticated && token) {
            socketService.connect(token);
          }
        }, 5000);
      };

      socketService.on('connected', handleConnected);
      socketService.on('disconnected', handleDisconnected);

      return () => {
        socketService.off('connected', handleConnected);
        socketService.off('disconnected', handleDisconnected);
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
    } else {
      // Disconnect if not authenticated
      socketService.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  }, [isAuthenticated, token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketService.cleanup();
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    socket: socketService,
  };
};

export const useSocketEvent = (event, handler, deps = []) => {
  const handlerRef = useRef(handler);
  
  // Update handler ref when it changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventHandler = (data) => {
      handlerRef.current(data);
    };

    socketService.on(event, eventHandler);
    
    return () => {
      socketService.off(event, eventHandler);
    };
  }, deps);
};

export const useTypingIndicator = (conversationId) => {
  const [typingUsers, setTypingUsers] = useState(new Set());
  const typingTimeoutRef = useRef(new Map());

  const startTyping = () => {
    if (conversationId) {
      socketService.startTyping(conversationId);
    }
  };

  const stopTyping = () => {
    if (conversationId) {
      socketService.stopTyping(conversationId);
    }
  };

  useSocketEvent('user_typing', (data) => {
    if (data.conversationId === conversationId) {
      setTypingUsers(prev => new Set(prev).add(data.userId));
      
      // Clear existing timeout for this user
      if (typingTimeoutRef.current.has(data.userId)) {
        clearTimeout(typingTimeoutRef.current.get(data.userId));
      }
      
      // Set new timeout to remove user from typing list
      const timeout = setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
        typingTimeoutRef.current.delete(data.userId);
      }, 3000); // Remove after 3 seconds of no typing
      
      typingTimeoutRef.current.set(data.userId, timeout);
    }
  }, [conversationId]);

  useSocketEvent('user_stopped_typing', (data) => {
    if (data.conversationId === conversationId) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
      
      // Clear timeout for this user
      if (typingTimeoutRef.current.has(data.userId)) {
        clearTimeout(typingTimeoutRef.current.get(data.userId));
        typingTimeoutRef.current.delete(data.userId);
      }
    }
  }, [conversationId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
    };
  }, []);

  return {
    typingUsers: Array.from(typingUsers),
    startTyping,
    stopTyping,
  };
};

export const useConversationEvents = (conversationId) => {
  const [participants, setParticipants] = useState(new Set());

  useEffect(() => {
    if (conversationId) {
      socketService.joinConversation(conversationId);
      
      return () => {
        socketService.leaveConversation(conversationId);
      };
    }
  }, [conversationId]);

  useSocketEvent('user_joined_conversation', (data) => {
    if (data.conversationId === conversationId) {
      setParticipants(prev => new Set(prev).add(data.userId));
    }
  }, [conversationId]);

  useSocketEvent('user_left_conversation', (data) => {
    if (data.conversationId === conversationId) {
      setParticipants(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    }
  }, [conversationId]);

  return {
    participants: Array.from(participants),
  };
};

export const useVoiceSession = () => {
  const [activeSessions, setActiveSessions] = useState(new Map());

  useSocketEvent('voice_session_started', (data) => {
    setActiveSessions(prev => new Map(prev).set(data.sessionId, {
      userId: data.userId,
      conversationId: data.conversationId,
      startTime: data.timestamp,
      status: 'active'
    }));
  });

  useSocketEvent('voice_session_ended', (data) => {
    setActiveSessions(prev => {
      const newMap = new Map(prev);
      if (newMap.has(data.sessionId)) {
        newMap.set(data.sessionId, {
          ...newMap.get(data.sessionId),
          status: 'ended',
          endTime: data.timestamp,
          duration: data.duration
        });
      }
      return newMap;
    });
  });

  const startVoiceSession = (sessionId, conversationId) => {
    socketService.startVoiceSession(sessionId, conversationId);
  };

  const endVoiceSession = (sessionId, conversationId, duration) => {
    socketService.endVoiceSession(sessionId, conversationId, duration);
  };

  return {
    activeSessions: Array.from(activeSessions.values()),
    startVoiceSession,
    endVoiceSession,
  };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useSocketEvent('notification', (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications
  });

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  return {
    notifications,
    clearNotifications,
    markAsRead,
  };
};

export const useCrisisAlerts = () => {
  const [crisisAlerts, setCrisisAlerts] = useState([]);

  useSocketEvent('crisis_alert', (alert) => {
    setCrisisAlerts(prev => [alert, ...prev].slice(0, 20)); // Keep last 20 alerts
  });

  const acknowledgeAlert = (alertId) => {
    setCrisisAlerts(prev => prev.filter(alert => alert.alertId !== alertId));
  };

  return {
    crisisAlerts,
    acknowledgeAlert,
  };
};