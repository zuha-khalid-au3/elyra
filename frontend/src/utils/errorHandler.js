/**
 * Error handler utility for API responses
 * Provides consistent error handling and user feedback
 */

/**
 * Handle API errors and return a user-friendly message
 * @param {Error} error - The error object from the API call
 * @param {Object} options - Additional options
 * @param {Function} options.onUnauthorized - Callback for 401 errors
 * @param {Function} options.onForbidden - Callback for 403 errors
 * @param {Function} options.onServerError - Callback for 500 errors
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, {
  onUnauthorized,
  onForbidden,
  onServerError,
} = {}) => {
  console.error('API Error:', error);
  
  // Default error message
  let errorMessage = 'An unexpected error occurred. Please try again later.';
  
  // Handle network errors
  if (!error.response) {
    errorMessage = 'Network error. Please check your internet connection and try again.';
    return errorMessage;
  }
  
  const { status, data } = error.response;
  
  // Handle different HTTP status codes
  switch (status) {
    case 400: // Bad Request
      errorMessage = data.error || 'Invalid request. Please check your input and try again.';
      break;
      
    case 401: // Unauthorized
      errorMessage = data.error || 'Your session has expired. Please log in again.';
      if (typeof onUnauthorized === 'function') {
        onUnauthorized();
      }
      break;
      
    case 403: // Forbidden
      errorMessage = data.error || 'You do not have permission to perform this action.';
      if (typeof onForbidden === 'function') {
        onForbidden();
      }
      break;
      
    case 404: // Not Found
      errorMessage = data.error || 'The requested resource was not found.';
      break;
      
    case 422: // Unprocessable Entity (validation errors)
      errorMessage = data.error || 'Validation error. Please check your input.';
      if (data.errors) {
        // Join validation error messages if available
        errorMessage = Object.values(data.errors)
          .map(err => Array.isArray(err) ? err.join(' ') : err)
          .join(' ');
      }
      break;
      
    case 500: // Internal Server Error
    case 502: // Bad Gateway
    case 503: // Service Unavailable
    case 504: // Gateway Timeout
      errorMessage = data.error || 'Our servers are currently experiencing issues. Please try again later.';
      if (typeof onServerError === 'function') {
        onServerError();
      }
      break;
      
    default:
      errorMessage = data.error || errorMessage;
  }
  
  return errorMessage;
};

/**
 * Handle form validation errors
 * @param {Object} errors - Validation errors from the API
 * @returns {Object} Formatted errors object for form validation
 */
export const handleValidationErrors = (errors) => {
  if (!errors) return {};
  
  // Convert API validation errors to formik format
  return Object.entries(errors).reduce((acc, [field, messages]) => {
    acc[field] = Array.isArray(messages) ? messages.join(' ') : messages;
    return acc;
  }, {});
};

/**
 * Create an error object with a user-friendly message
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {any} details - Additional error details
 * @returns {Error} Error object with additional properties
 */
export const createError = (message, code = 'UNKNOWN_ERROR', details = null) => {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
};
