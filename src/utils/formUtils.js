import { VALIDATION_PATTERNS, ERROR_MESSAGES } from './constants';

// Form validation utilities
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!VALIDATION_PATTERNS.email.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!VALIDATION_PATTERNS.password.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters long';
  if (name.length > 50) return 'Name must be less than 50 characters long';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  if (!VALIDATION_PATTERNS.phone.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

export const validateUrl = (url) => {
  if (!url) return null; // URL is optional
  if (!VALIDATION_PATTERNS.url.test(url)) {
    return 'Please enter a valid URL';
  }
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateLength = (value, min, max, fieldName) => {
  if (!value) return null;
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters long`;
  }
  if (max && value.length > max) {
    return `${fieldName} must be less than ${max} characters long`;
  }
  return null;
};

// Form state management utilities
export const createFormState = (initialValues = {}) => {
  return {
    values: { ...initialValues },
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  };
};

export const updateFormValue = (formState, field, value) => {
  return {
    ...formState,
    values: {
      ...formState.values,
      [field]: value,
    },
    touched: {
      ...formState.touched,
      [field]: true,
    },
  };
};

export const updateFormError = (formState, field, error) => {
  return {
    ...formState,
    errors: {
      ...formState.errors,
      [field]: error,
    },
  };
};

export const clearFormErrors = (formState) => {
  return {
    ...formState,
    errors: {},
  };
};

export const validateForm = (values, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach((field) => {
    const rules = validationRules[field];
    const value = values[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  
  return errors;
};

// Common form handlers
export const createFormHandlers = (formState, setFormState) => {
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormState(prev => updateFormValue(prev, field, value));
  };

  const handleBlur = (field, validator) => () => {
    const value = formState.values[field];
    const error = validator ? validator(value) : null;
    setFormState(prev => updateFormError(prev, field, error));
  };

  const handleSubmit = (onSubmit, validationRules) => async (event) => {
    event.preventDefault();
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    // Validate form
    const errors = validateForm(formState.values, validationRules);
    const hasErrors = Object.keys(errors).length > 0;
    
    setFormState(prev => ({
      ...prev,
      errors,
      isValid: !hasErrors,
    }));
    
    if (!hasErrors) {
      try {
        await onSubmit(formState.values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setFormState(prev => ({ ...prev, isSubmitting: false }));
  };

  const resetForm = (initialValues = {}) => {
    setFormState(createFormState(initialValues));
  };

  return {
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
};

// Password visibility toggle
export const createPasswordVisibility = (initialState = false) => {
  let showPassword = initialState;
  
  const togglePassword = () => {
    showPassword = !showPassword;
    return showPassword;
  };
  
  const getPasswordVisibility = () => showPassword;
  
  return { togglePassword, getPasswordVisibility };
};

// Form field helpers
export const getFieldError = (formState, field) => {
  return formState.touched[field] && formState.errors[field];
};

export const isFieldValid = (formState, field) => {
  return formState.touched[field] && !formState.errors[field];
};

export const getFieldProps = (formState, field) => {
  return {
    value: formState.values[field] || '',
    error: getFieldError(formState, field),
    isValid: isFieldValid(formState, field),
  };
};

// File upload utilities
export const validateFileSize = (file, maxSizeInMB = 5) => {
  if (!file) return 'File is required';
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return `File size must be less than ${maxSizeInMB}MB`;
  }
  return null;
};

export const validateFileType = (file, allowedTypes = []) => {
  if (!file) return 'File is required';
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  return null;
};

export const createFileReader = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default {
  validate: {
    email: validateEmail,
    password: validatePassword,
    confirmPassword: validateConfirmPassword,
    name: validateName,
    phone: validatePhone,
    url: validateUrl,
    required: validateRequired,
    length: validateLength,
    fileSize: validateFileSize,
    fileType: validateFileType,
  },
  form: {
    createState: createFormState,
    updateValue: updateFormValue,
    updateError: updateFormError,
    clearErrors: clearFormErrors,
    validateForm,
    createHandlers: createFormHandlers,
  },
  field: {
    getError: getFieldError,
    isValid: isFieldValid,
    getProps: getFieldProps,
  },
  file: {
    createReader: createFileReader,
  },
};