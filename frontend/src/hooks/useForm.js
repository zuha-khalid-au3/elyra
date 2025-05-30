import { useState, useCallback, useRef, useEffect } from 'react';
import { validateField } from 'utils/validation';

/**
 * Custom hook for managing form state and validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validators - Validation rules for each field
 * @param {Function} onSubmit - Form submission handler
 * @param {Object} options - Additional options
 * @returns {Object} Form state and handlers
 */
const useForm = (initialValues = {}, validators = {}, onSubmit, options = {}) => {
  const {
    validateOnChange = true, // Validate on field change
    validateOnBlur = true,   // Validate on field blur
    validateOnSubmit = true, // Validate on form submission
  } = options;

  // Form state
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isValid, setIsValid] = useState(false);
  
  // Keep track of mounted state to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Set up cleanup for when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Validate a single field
   * @param {string} field - Field name
   * @param {*} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  const validate = useCallback((field, value) => {
    if (!validators[field]) return null;
    
    const validator = validators[field];
    const result = typeof validator === 'function' 
      ? validator(value, values) 
      : validateField(value, validator);
    
    return result === true ? null : result;
  }, [validators, values]);

  /**
   * Validate all fields
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let formIsValid = true;
    
    Object.keys(validators).forEach(field => {
      const error = validate(field, values[field]);
      if (error) {
        newErrors[field] = error;
        formIsValid = false;
      }
    });
    
    if (isMounted.current) {
      setErrors(newErrors);
      setIsValid(formIsValid && Object.keys(newErrors).length === 0);
    }
    
    return formIsValid;
  }, [validate, validators, values]);

  // Update form validity when values or validators change
  useEffect(() => {
    if (isMounted.current) {
      validateForm();
    }
  }, [values, validateForm]);

  /**
   * Handle input change
   * @param {Object} e - Event object or { target: { name, value, type, checked } }
   */
  const handleChange = useCallback((e) => {
    const target = e.target || e;
    const { name, value, type, checked } = target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : value;
    
    // Update field value
    setValues(prevValues => ({
      ...prevValues,
      [name]: inputValue
    }));
    
    // Clear field error when user types
    if (errors[name] && isMounted.current) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
    
    // Validate on change if enabled
    if (validateOnChange && validators[name]) {
      const error = validate(name, inputValue);
      if (isMounted.current) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: error
        }));
      }
    }
  }, [errors, validate, validateOnChange, validators]);

  /**
   * Handle input blur
   * @param {Object} e - Event object or { target: { name } }
   */
  const handleBlur = useCallback((e) => {
    const name = (e.target || e).name;
    
    if (isMounted.current) {
      setTouched(prevTouched => ({
        ...prevTouched,
        [name]: true
      }));
      
      // Validate on blur if enabled
      if (validateOnBlur && validators[name]) {
        const error = validate(name, values[name]);
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: error
        }));
      }
    }
  }, [validate, validateOnBlur, validators, values]);

  /**
   * Handle form submission
   * @param {Object} e - Form event
   */
  const handleSubmit = useCallback(async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    
    // Mark all fields as touched
    const newTouched = {};
    Object.keys(values).forEach(field => {
      newTouched[field] = true;
    });
    
    if (isMounted.current) {
      setTouched(newTouched);
    }
    
    // Validate form if enabled
    let formIsValid = true;
    if (validateOnSubmit) {
      formIsValid = validateForm();
    }
    
    if (!formIsValid) {
      // Focus on first error field
      const firstErrorField = Object.keys(validators).find(field => errors[field]);
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) element.focus();
      }
      return;
    }
    
    // Submit form
    if (onSubmit) {
      try {
        if (isMounted.current) {
          setIsSubmitting(true);
          setSubmitError(null);
        }
        
        await onSubmit(values, { setErrors, setSubmitError });
      } catch (error) {
        if (isMounted.current) {
          setSubmitError(error.message || 'An error occurred while submitting the form');
        }
        throw error;
      } finally {
        if (isMounted.current) {
          setIsSubmitting(false);
        }
      }
    }
  }, [errors, onSubmit, validateForm, validateOnSubmit, validators, values]);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    if (isMounted.current) {
      setValues(initialValues);
      setErrors({});
      setTouched({});
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [initialValues]);

  /**
   * Set form field values
   * @param {Object} newValues - New values to merge with current values
   * @param {boolean} shouldValidate - Whether to validate after setting values
   */
  const setFieldValue = useCallback((field, value, shouldValidate = true) => {
    if (isMounted.current) {
      setValues(prevValues => ({
        ...prevValues,
        [field]: value
      }));
      
      if (shouldValidate && validators[field]) {
        const error = validate(field, value);
        setErrors(prevErrors => ({
          ...prevErrors,
          [field]: error
        }));
      }
    }
  }, [validate, validators]);

  /**
   * Set multiple form field values
   * @param {Object} newValues - New values to merge with current values
   * @param {boolean} shouldValidate - Whether to validate after setting values
   */
  const setValuesWithValidation = useCallback((newValues, shouldValidate = true) => {
    if (isMounted.current) {
      setValues(prevValues => ({
        ...prevValues,
        ...newValues
      }));
      
      if (shouldValidate) {
        const newErrors = { ...errors };
        let hasErrors = false;
        
        Object.keys(newValues).forEach(field => {
          if (validators[field]) {
            const error = validate(field, newValues[field]);
            if (error) {
              newErrors[field] = error;
              hasErrors = true;
            } else if (newErrors[field]) {
              delete newErrors[field];
            }
          }
        });
        
        if (hasErrors || Object.keys(newErrors).length !== Object.keys(errors).length) {
          setErrors(newErrors);
        }
      }
    }
  }, [errors, validate, validators]);

  /**
   * Set field error
   * @param {string} field - Field name
   * @param {string} error - Error message
   */
  const setFieldError = useCallback((field, error) => {
    if (isMounted.current) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [field]: error
      }));
    }
  }, []);

  /**
   * Set field touched state
   * @param {string} field - Field name
   * @param {boolean} isTouched - Whether the field has been touched
   */
  const setFieldTouched = useCallback((field, isTouched = true) => {
    if (isMounted.current) {
      setTouched(prevTouched => ({
        ...prevTouched,
        [field]: isTouched
      }));
    }
  }, []);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    isValid,
    
    // Form handlers
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    
    // Field manipulation
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues: setValuesWithValidation,
    
    // Validation
    validate: validateForm,
    
    // Form props (for easier spread)
    formProps: {
      onSubmit: handleSubmit,
      noValidate: true,
    },
    
    // Field props generator
    getFieldProps: (field) => ({
      name: field,
      value: values[field] ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[field] ? errors[field] : null,
    }),
  };
};

export default useForm;
