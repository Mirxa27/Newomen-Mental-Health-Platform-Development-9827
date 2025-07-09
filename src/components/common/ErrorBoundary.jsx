import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import errorService from '../../services/errorService';

const { FiAlertTriangle, FiRefreshCw, FiHome, FiMessageCircle } = FiIcons;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
    
    this.handleRetry = this.handleRetry.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorData = errorService.handleGlobalError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      errorId: errorData.timestamp,
    });
  }

  handleRetry() {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
    }));
  }

  handleGoHome() {
    window.location.href = '/';
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId, retryCount } = this.state;
      const { fallback: Fallback, level = 'page' } = this.props;

      // If a custom fallback is provided, use it
      if (Fallback) {
        return (
          <Fallback
            error={error}
            errorInfo={errorInfo}
            errorId={errorId}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
            onReload={this.handleReload}
          />
        );
      }

      // Component-level error
      if (level === 'component') {
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <div className="flex items-center">
              <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-red-800 font-medium">Something went wrong</h3>
            </div>
            <p className="text-red-700 text-sm mt-2">
              This component encountered an error. Please try again.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <SafeIcon icon={FiRefreshCw} className="h-4 w-4 mr-1" />
                Retry
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-3">
                <summary className="text-xs text-red-600 cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-600 mt-2 overflow-auto">
                  {error?.stack}
                </pre>
              </details>
            )}
          </div>
        );
      }

      // Page-level error
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
          >
            <div className="mb-6">
              <SafeIcon icon={FiAlertTriangle} className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
              <p className="text-gray-600">
                We're sorry for the inconvenience. Our team has been notified and is working to fix this issue.
              </p>
              
              {errorId && (
                <p className="mt-2 text-xs text-gray-500">
                  Error ID: {errorId}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {retryCount < 3 && (
                <button
                  onClick={this.handleRetry}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              )}

              <button
                onClick={this.handleGoHome}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SafeIcon icon={FiHome} className="w-4 h-4 mr-2" />
                Go Home
              </button>

              <button
                onClick={this.handleReload}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
                Reload Page
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-center">
                <SafeIcon icon={FiMessageCircle} className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-blue-800 font-medium">Need Help?</h3>
              </div>
              <p className="text-blue-700 text-sm mt-2">
                If this problem persists, please contact our support team at{' '}
                <a 
                  href="mailto:support@newomen.com" 
                  className="underline font-medium"
                >
                  support@newomen.com
                </a>
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-600 cursor-pointer">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded-md">
                  <pre className="text-xs text-gray-800 overflow-auto">
                    {error?.stack}
                  </pre>
                  {errorInfo && (
                    <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundaries
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, errorInfo = {}) => {
    errorService.handleError(error, errorInfo);
  }, []);

  return handleError;
};

export default ErrorBoundary;