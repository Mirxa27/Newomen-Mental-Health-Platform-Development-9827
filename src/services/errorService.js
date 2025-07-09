import { toast } from 'react-hot-toast';

class ErrorService {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 10;
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingErrors();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Main error handling method
  handleError(error, context = {}) {
    const errorData = this.normalizeError(error, context);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', errorData);
    }
    
    // Show user-friendly message
    this.showUserMessage(errorData);
    
    // Queue for logging/analytics
    this.queueError(errorData);
    
    // Report to analytics service (if available)
    this.reportError(errorData);
    
    return errorData;
  }

  // Normalize different error types
  normalizeError(error, context) {
    const timestamp = new Date().toISOString();
    const userAgent = navigator.userAgent;
    const url = window.location.href;
    
    let errorData = {
      timestamp,
      userAgent,
      url,
      context,
      stack: null,
      message: 'An unexpected error occurred',
      type: 'unknown',
      severity: 'medium',
      ...context
    };

    // Handle different error types
    if (error instanceof Error) {
      errorData.message = error.message;
      errorData.stack = error.stack;
      errorData.type = error.name || 'Error';
      
      // Check for specific error types
      if (error.name === 'TypeError') {
        errorData.severity = 'high';
      } else if (error.name === 'ReferenceError') {
        errorData.severity = 'high';
      } else if (error.name === 'SyntaxError') {
        errorData.severity = 'critical';
      }
    } else if (typeof error === 'string') {
      errorData.message = error;
      errorData.type = 'string';
    } else if (error && error.response) {
      // Axios error
      errorData.message = error.response.data?.error || error.response.data?.message || error.message;
      errorData.type = 'http';
      errorData.status = error.response.status;
      errorData.statusText = error.response.statusText;
      
      // Determine severity based on status code
      if (error.response.status >= 500) {
        errorData.severity = 'high';
      } else if (error.response.status >= 400) {
        errorData.severity = 'medium';
      } else {
        errorData.severity = 'low';
      }
    } else if (error && error.code) {
      // Network error
      errorData.message = error.message || 'Network error';
      errorData.type = 'network';
      errorData.code = error.code;
      errorData.severity = 'medium';
    }

    return errorData;
  }

  // Show user-friendly error messages
  showUserMessage(errorData) {
    let message = this.getUserFriendlyMessage(errorData);
    
    // Don't show duplicate messages
    if (this.lastMessage === message) {
      return;
    }
    this.lastMessage = message;
    
    // Show toast based on severity
    switch (errorData.severity) {
      case 'critical':
        toast.error(message, { duration: 8000 });
        break;
      case 'high':
        toast.error(message, { duration: 6000 });
        break;
      case 'medium':
        toast.error(message, { duration: 4000 });
        break;
      case 'low':
        toast(message, { duration: 3000 });
        break;
      default:
        toast(message);
    }
  }

  // Convert technical errors to user-friendly messages
  getUserFriendlyMessage(errorData) {
    const { type, status, message, context } = errorData;
    
    // Network-related errors
    if (type === 'network' || !this.isOnline) {
      return 'Please check your internet connection and try again.';
    }
    
    // HTTP errors
    if (type === 'http') {
      switch (status) {
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return 'You don\'t have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
          return 'Server error. Please try again later.';
        case 502:
        case 503:
        case 504:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return message || 'Something went wrong. Please try again.';
      }
    }
    
    // Context-specific messages
    if (context.action) {
      switch (context.action) {
        case 'login':
          return 'Unable to log in. Please check your credentials.';
        case 'register':
          return 'Unable to create account. Please try again.';
        case 'send_message':
          return 'Unable to send message. Please try again.';
        case 'load_conversations':
          return 'Unable to load conversations. Please refresh the page.';
        case 'save_data':
          return 'Unable to save data. Please try again.';
        case 'upload_file':
          return 'Unable to upload file. Please check file size and format.';
        case 'voice_session':
          return 'Unable to start voice session. Please check your microphone permissions.';
        case 'payment':
          return 'Payment could not be processed. Please try again or contact support.';
        default:
          return message || 'Something went wrong. Please try again.';
      }
    }
    
    // Default fallback
    return message || 'Something went wrong. Please try again.';
  }

  // Queue errors for batch processing
  queueError(errorData) {
    this.errorQueue.push(errorData);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
    
    // Process queue if online
    if (this.isOnline) {
      this.processPendingErrors();
    }
  }

  // Process pending errors when back online
  processPendingErrors() {
    if (this.errorQueue.length === 0) return;
    
    // Send errors to logging service
    this.sendToLoggingService(this.errorQueue);
    
    // Clear queue
    this.errorQueue = [];
  }

  // Send errors to logging service
  async sendToLoggingService(errors) {
    if (!this.isOnline || errors.length === 0) return;
    
    try {
      // Send to your logging service
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors }),
      });
    } catch (error) {
      // Silently fail - don't create error loops
      console.warn('Failed to send errors to logging service:', error);
    }
  }

  // Report to analytics service
  reportError(errorData) {
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'exception', {
        description: errorData.message,
        fatal: errorData.severity === 'critical'
      });
    }
    
    // Report to other analytics services if available
    if (typeof window !== 'undefined' && typeof window.analytics !== 'undefined') {
      window.analytics.track('Error', {
        message: errorData.message,
        type: errorData.type,
        severity: errorData.severity,
        context: errorData.context
      });
    }
  }

  // Specific error handlers
  handleAuthError(error) {
    return this.handleError(error, { action: 'auth', severity: 'high' });
  }

  handleNetworkError(error) {
    return this.handleError(error, { action: 'network', severity: 'medium' });
  }

  handleValidationError(error) {
    return this.handleError(error, { action: 'validation', severity: 'low' });
  }

  handlePaymentError(error) {
    return this.handleError(error, { action: 'payment', severity: 'high' });
  }

  handleVoiceError(error) {
    return this.handleError(error, { action: 'voice_session', severity: 'medium' });
  }

  handleUploadError(error) {
    return this.handleError(error, { action: 'upload_file', severity: 'medium' });
  }

  // Global error boundary handler
  handleGlobalError(error, errorInfo) {
    const errorData = this.normalizeError(error, {
      action: 'react_error_boundary',
      severity: 'high',
      errorInfo: errorInfo?.componentStack
    });
    
    this.queueError(errorData);
    this.reportError(errorData);
    
    // Don't show toast for error boundary - let the boundary handle UI
    return errorData;
  }

  // Unhandled promise rejection handler
  handleUnhandledRejection(event) {
    const error = event.reason;
    const errorData = this.normalizeError(error, {
      action: 'unhandled_rejection',
      severity: 'high'
    });
    
    this.showUserMessage(errorData);
    this.queueError(errorData);
    this.reportError(errorData);
    
    // Prevent default browser behavior
    event.preventDefault();
  }

  // JavaScript error handler
  handleJSError(event) {
    const error = new Error(event.message);
    error.filename = event.filename;
    error.lineno = event.lineno;
    error.colno = event.colno;
    
    const errorData = this.normalizeError(error, {
      action: 'js_error',
      severity: 'high',
      filename: event.filename,
      line: event.lineno,
      column: event.colno
    });
    
    this.showUserMessage(errorData);
    this.queueError(errorData);
    this.reportError(errorData);
    
    return true; // Prevent default browser error handling
  }

  // Initialize global error handlers
  initializeGlobalHandlers() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event);
    });

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleJSError(event);
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError(new Error(`Resource loading error: ${event.target.src || event.target.href}`), {
          action: 'resource_load',
          severity: 'medium',
          resource: event.target.tagName
        });
      }
    }, true);
  }

  // Get error statistics
  getErrorStats() {
    return {
      queueSize: this.errorQueue.length,
      isOnline: this.isOnline,
      lastMessage: this.lastMessage
    };
  }

  // Clear error queue
  clearErrorQueue() {
    this.errorQueue = [];
  }
}

export default new ErrorService();