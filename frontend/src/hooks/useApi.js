import { useState, useCallback, useRef } from 'react';
import { handleApiError } from 'utils/errorHandler';

/**
 * Custom hook for making API calls with loading and error states
 * @param {Function} apiCall - The async function that makes the API call
 * @param {Object} options - Configuration options
 * @param {boolean} options.initialLoading - Initial loading state (default: false)
 * @param {Function} options.onSuccess - Callback function on successful API call
 * @param {Function} options.onError - Callback function on API call error
 * @param {Function} options.onComplete - Callback function when API call completes (success or error)
 * @returns {Object} API call state and handlers
 */
const useApi = (apiCall, options = {}) => {
  const {
    initialLoading = false,
    onSuccess = null,
    onError = null,
    onComplete = null,
  } = options;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Keep track of mounted state to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Set up cleanup for when component unmounts
  useState(() => {
    return () => {
      isMounted.current = false;
    };
  });

  /**
   * Make an API call with the provided arguments
   * @param  {...any} args - Arguments to pass to the API call
   * @returns {Promise<*>} The API response data
   */
  const callApi = useCallback(
    async (...args) => {
      if (!isMounted.current) return null;
      
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        const response = await apiCall(...args);
        
        if (isMounted.current) {
          setData(response);
          setIsSuccess(true);
          
          // Call success callback if provided
          if (typeof onSuccess === 'function') {
            onSuccess(response, ...args);
          }
          
          return response;
        }
      } catch (err) {
        if (isMounted.current) {
          // Handle API errors
          const errorMessage = handleApiError(err, {
            onUnauthorized: () => {
              // Handle unauthorized errors (e.g., token expired)
              localStorage.removeItem('token');
            },
          });
          
          const apiError = new Error(errorMessage);
          setError(apiError);
          
          // Call error callback if provided
          if (typeof onError === 'function') {
            onError(apiError, ...args);
          }
          
          throw apiError;
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          
          // Call complete callback if provided
          if (typeof onComplete === 'function') {
            onComplete(...args);
          }
        }
      }
      
      return null;
    },
    [apiCall, onSuccess, onError, onComplete]
  );

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    if (isMounted.current) {
      setData(null);
      setIsLoading(initialLoading);
      setError(null);
      setIsSuccess(false);
    }
  }, [initialLoading]);

  return {
    // State
    data,
    isLoading,
    error,
    isSuccess,
    
    // Actions
    callApi,
    reset,
    setData,
    setError,
    
    // Aliases for convenience
    fetch: callApi,
    loading: isLoading,
    apiError: error,
  };
};

export default useApi;
