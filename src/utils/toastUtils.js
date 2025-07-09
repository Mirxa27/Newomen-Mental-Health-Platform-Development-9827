import toast from 'react-hot-toast';
import { TOAST_TYPES, SUCCESS_MESSAGES, ERROR_MESSAGES } from './constants';

// Toast configuration
const toastConfig = {
  duration: 3000,
  position: 'top-right',
  style: {
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    borderRadius: '12px',
    padding: '12px 16px',
    backdropFilter: 'blur(10px)',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: 'white',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: 'white',
    },
  },
};

// Success toast
export const showSuccessToast = (message = SUCCESS_MESSAGES.SAVED) => {
  toast.success(message, toastConfig);
};

// Error toast
export const showErrorToast = (message = ERROR_MESSAGES.GENERAL_ERROR) => {
  toast.error(message, toastConfig);
};

// Warning toast
export const showWarningToast = (message) => {
  toast(message, {
    ...toastConfig,
    icon: '⚠️',
  });
};

// Info toast
export const showInfoToast = (message) => {
  toast(message, {
    ...toastConfig,
    icon: 'ℹ️',
  });
};

// Loading toast
export const showLoadingToast = (message = 'Loading...') => {
  return toast.loading(message, toastConfig);
};

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Promise toast (for async operations)
export const showPromiseToast = (promise, messages = {}) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || SUCCESS_MESSAGES.SAVED,
      error: messages.error || ERROR_MESSAGES.GENERAL_ERROR,
    },
    toastConfig
  );
};

// Form validation toast
export const showValidationToast = (errors) => {
  if (Array.isArray(errors)) {
    errors.forEach((error) => {
      showErrorToast(error.message || error);
    });
  } else if (typeof errors === 'string') {
    showErrorToast(errors);
  } else {
    showErrorToast(ERROR_MESSAGES.VALIDATION_ERROR);
  }
};

// Network error toast
export const showNetworkErrorToast = () => {
  showErrorToast(ERROR_MESSAGES.NETWORK_ERROR);
};

// Unauthorized error toast
export const showUnauthorizedToast = () => {
  showErrorToast(ERROR_MESSAGES.UNAUTHORIZED);
};

// Custom toast with custom styling
export const showCustomToast = (message, options = {}) => {
  const customConfig = {
    ...toastConfig,
    ...options,
    style: {
      ...toastConfig.style,
      ...options.style,
    },
  };

  if (options.type === TOAST_TYPES.SUCCESS) {
    return toast.success(message, customConfig);
  } else if (options.type === TOAST_TYPES.ERROR) {
    return toast.error(message, customConfig);
  } else {
    return toast(message, customConfig);
  }
};

// Batch toast operations
export const showBatchToasts = (toasts) => {
  toasts.forEach((toastItem, index) => {
    setTimeout(() => {
      showCustomToast(toastItem.message, toastItem.options);
    }, index * 100);
  });
};

export default {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  loading: showLoadingToast,
  promise: showPromiseToast,
  validation: showValidationToast,
  network: showNetworkErrorToast,
  unauthorized: showUnauthorizedToast,
  custom: showCustomToast,
  batch: showBatchToasts,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
};