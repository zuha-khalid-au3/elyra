/**
 * Validation utility functions
 * Provides common validation rules and helpers for form validation
 */

/**
 * Check if a value is empty
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is empty, false otherwise
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {string|boolean} Error message if invalid, true if valid
 */
export const validateEmail = (email) => {
  if (isEmpty(email)) return 'Email is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  
  return true;
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {string|boolean} Error message if invalid, true if valid
 */
export const validatePassword = (password) => {
  if (isEmpty(password)) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  
  return true;
};

/**
 * Validate that two fields match (e.g., password confirmation)
 * @param {string} value1 - First value
 * @param {string} value2 - Second value
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|boolean} Error message if invalid, true if valid
 */
export const validateMatch = (value1, value2, fieldName = 'Fields') => {
  if (value1 !== value2) return `${fieldName} do not match`;
  return true;
};

/**
 * Validate required field
 * @param {string} value - The value to check
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|boolean} Error message if invalid, true if valid
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (isEmpty(value)) return `${fieldName} is required`;
  return true;
};

/**
 * Validate minimum length
 * @param {string} value - The value to check
 * @param {number} min - Minimum length
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|boolean} Error message if invalid, true if valid
 */
export const validateMinLength = (value, min, fieldName) => {
  if (isEmpty(value)) return true; // Let required handle empty values
  if (value.length < min) {
    return fieldName 
      ? `${fieldName} must be at least ${min} characters`
      : `Must be at least ${min} characters`;
  }
  return true;
};

/**
 * Validate maximum length
 * @param {string} value - The value to check
 * @param {number} max - Maximum length
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|boolean} Error message if invalid, true if valid
 */
export const validateMaxLength = (value, max, fieldName) => {
  if (isEmpty(value)) return true; // Let required handle empty values
  if (value.length > max) {
    return fieldName 
      ? `${fieldName} must be at most ${max} characters`
      : `Must be at most ${max} characters`;
  }
  return true;
};

/**
 * Validate phone number format
 * @param {string} phone - The phone number to validate
 * @returns {string|boolean} Error message if invalid, true if valid
 */
export const validatePhone = (phone) => {
  if (isEmpty(phone)) return true; // Phone is optional
  
  // Basic phone validation - allows numbers, spaces, dashes, and parentheses
  const phoneRegex = /^[\+\d\s\-\(\)]{8,20}$/;
  if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
  
  return true;
};

/**
 * Validate URL format
 * @param {string} url - The URL to validate
 * @returns {string|boolean} Error message if invalid, true if valid
 */
export const validateUrl = (url) => {
  if (isEmpty(url)) return true; // URL is optional
  
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch (e) {
    return 'Please enter a valid URL';
  }
};

/**
 * Validate numeric value
 * @param {string|number} value - The value to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|boolean} Error message if invalid, true if valid
 */
export const validateNumber = (value, { min, max } = {}, fieldName = 'Value') => {
  if (isEmpty(value)) return true; // Let required handle empty values
  
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== undefined && num > max) {
    return `${fieldName} must be at most ${max}`;
  }
  
  return true;
};

/**
 * Validate a field against multiple validation rules
 * @param {*} value - The value to validate
 * @param {Array<Function>} validators - Array of validation functions
 * @returns {string|boolean} First error message found, or true if all validations pass
 */
export const validateField = (value, validators = []) => {
  for (const validator of validators) {
    const result = validator(value);
    if (result !== true) return result;
  }
  return true;
};

/**
 * Create a validation function for a specific field
 * @param {string} fieldName - Name of the field for error messages
 * @param {Array<Function>} validators - Array of validation functions
 * @returns {Function} Validation function that takes a value and returns an error message or true
 */
export const createFieldValidator = (fieldName, validators = []) => {
  return (value) => {
    for (const validator of validators) {
      const result = validator(value, fieldName);
      if (result !== true) return result;
    }
    return true;
  };
};
