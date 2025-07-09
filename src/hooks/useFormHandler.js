import { useState, useCallback } from 'react';
import { validateForm } from '../utils/formUtils';
import { showErrorToast, showSuccessToast } from '../utils/toastUtils';

// Centralized form handling hook
export const useFormHandler = (initialValues = {}, validationRules = {}) => {
  const [formState, setFormState] = useState({
    values: { ...initialValues },
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  // Update form value
  const updateValue = useCallback((field, value) => {
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
      touched: {
        ...prev.touched,
        [field]: true,
      },
      // Clear error when user starts typing
      errors: {
        ...prev.errors,
        [field]: undefined,
      },
    }));
  }, []);

  // Update form error
  const updateError = useCallback((field, error) => {
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error,
      },
    }));
  }, []);

  // Validate single field
  const validateField = useCallback((field, value) => {
    const rules = validationRules[field];
    if (!rules) return null;

    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        updateError(field, error);
        return error;
      }
    }

    updateError(field, null);
    return null;
  }, [validationRules, updateError]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const errors = validateForm(formState.values, validationRules);
    setFormState(prev => ({
      ...prev,
      errors,
      isValid: Object.keys(errors).length === 0,
    }));
    return errors;
  }, [formState.values, validationRules]);

  // Handle input change
  const handleChange = useCallback((field) => (event) => {
    const value = event.target.value;
    updateValue(field, value);
  }, [updateValue]);

  // Handle input blur
  const handleBlur = useCallback((field) => () => {
    const value = formState.values[field];
    validateField(field, value);
  }, [formState.values, validateField]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit, options = {}) => async (event) => {
    event.preventDefault();
    
    if (formState.isSubmitting) return;
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Validate form
      const errors = validateAll();
      const hasErrors = Object.keys(errors).length > 0;
      
      if (hasErrors) {
        if (options.showValidationErrors) {
          const firstError = Object.values(errors)[0];
          showErrorToast(firstError);
        }
        return;
      }
      
      // Call submit handler
      await onSubmit(formState.values);
      
      // Show success message if provided
      if (options.successMessage) {
        showSuccessToast(options.successMessage);
      }
      
      // Reset form if requested
      if (options.resetOnSuccess) {
        resetForm();
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Show error message
      const errorMessage = error.message || options.errorMessage || 'An error occurred. Please try again.';
      showErrorToast(errorMessage);
      
      // Set server errors if provided
      if (error.validationErrors) {
        setFormState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            ...error.validationErrors,
          },
        }));
      }
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.values, formState.isSubmitting, validateAll]);

  // Reset form
  const resetForm = useCallback((newInitialValues = initialValues) => {
    setFormState({
      values: { ...newInitialValues },
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [initialValues]);

  // Set form values
  const setValues = useCallback((values) => {
    setFormState(prev => ({
      ...prev,
      values: { ...values },
    }));
  }, []);

  // Get field props for easy spreading
  const getFieldProps = useCallback((field) => ({
    value: formState.values[field] || '',
    onChange: handleChange(field),
    onBlur: handleBlur(field),
    error: formState.touched[field] && formState.errors[field],
    isValid: formState.touched[field] && !formState.errors[field],
  }), [formState.values, formState.touched, formState.errors, handleChange, handleBlur]);

  // Get field error
  const getFieldError = useCallback((field) => {
    return formState.touched[field] && formState.errors[field];
  }, [formState.touched, formState.errors]);

  // Check if field is valid
  const isFieldValid = useCallback((field) => {
    return formState.touched[field] && !formState.errors[field];
  }, [formState.touched, formState.errors]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return Object.keys(formState.errors).length === 0 && 
           Object.keys(formState.touched).length > 0;
  }, [formState.errors, formState.touched]);

  return {
    // State
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    
    // Actions
    updateValue,
    updateError,
    validateField,
    validateAll,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    
    // Utilities
    getFieldProps,
    getFieldError,
    isFieldValid,
    isFormValid,
  };
};

export default useFormHandler;