import { useState, useCallback } from 'react';
import { handleApiError } from 'utils/errorHandler';

/**
 * Custom hook for handling form submissions with loading and error states
 * @param {Function} submitFn - The async function to call on form submission
 * @param {Object} options - Additional options
 * @param {Function} options.onSuccess - Callback function on successful submission
 * @param {Function} options.onError - Callback function on submission error
 * @param {boolean} options.resetOnSuccess - Whether to reset form on success (default: false)
 * @returns {Object} Form submission state and handlers
 */
const useFormSubmit = (submitFn, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    resetOnSuccess = false,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Handle form submission
   * @param {Object} values - Form values to submit
   * @param {Object} formikHelpers - Formik helpers (if using Formik)
   * @returns {Promise<void>}
   */
  const handleSubmit = useCallback(
    async (values, formikHelpers) => {
      setIsSubmitting(true);
      setError(null);
      setIsSuccess(false);

      try {
        const result = await submitFn(values);
        
        // Call onSuccess callback if provided
        if (typeof onSuccess === 'function') {
          onSuccess(result, values, formikHelpers);
        }

        // Reset form if specified and formikHelpers is provided
        if (resetOnSuccess && formikHelpers) {
          formikHelpers.resetForm();
        }

        setIsSuccess(true);
        return result;
      } catch (err) {
        console.error('Form submission error:', err);
        
        // Handle API errors
        const errorMessage = handleApiError(err, {
          onUnauthorized: () => {
            // Handle unauthorized errors (e.g., token expired)
            localStorage.removeItem('token');
          },
        });

        // Set form error
        const submissionError = new Error(errorMessage);
        setError(submissionError);

        // Call onError callback if provided
        if (typeof onError === 'function') {
          onError(submissionError, values, formikHelpers);
        }

        // Set form errors if using Formik
        if (formikHelpers && err.response?.data?.errors) {
          formikHelpers.setErrors(err.response.data.errors);
        }

        throw submissionError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitFn, onSuccess, onError, resetOnSuccess]
  );

  /**
   * Reset the form state
   */
  const reset = useCallback(() => {
    setIsSubmitting(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    // State
    isSubmitting,
    error,
    isSuccess,
    
    // Actions
    handleSubmit,
    reset,
    setError,
    
    // Aliases for convenience
    onSubmit: handleSubmit,
    loading: isSubmitting,
    submitError: error,
  };
};

export default useFormSubmit;
