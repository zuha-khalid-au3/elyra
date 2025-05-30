/**
 * Authentication utility functions
 * Provides helper functions for authentication-related tasks
 */

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get auth token from localStorage
 * @returns {string|null} The auth token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Save auth token to localStorage
 * @param {string} token - The JWT token to save
 */
export const saveAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

/**
 * Check if current user has admin role
 * @param {Object} user - The user object from context
 * @returns {boolean} True if user is admin, false otherwise
 */
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

/**
 * Redirect to login page with return URL
 * @param {string} returnUrl - The URL to return to after login (default: current path)
 */
export const redirectToLogin = (returnUrl) => {
  const currentPath = window.location.pathname + window.location.search;
  const redirectPath = returnUrl || currentPath;
  window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}`;
};

/**
 * Handle unauthorized access
 * @param {Object} options - Options for handling unauthorized access
 * @param {boolean} options.redirect - Whether to redirect to login (default: true)
 * @param {string} options.redirectUrl - Custom redirect URL (default: login page)
 * @param {Function} options.onUnauthorized - Callback function to run when unauthorized
 */
export const handleUnauthorized = (options = {}) => {
  const {
    redirect = true,
    redirectUrl = null,
    onUnauthorized = null,
  } = options;

  // Run custom callback if provided
  if (typeof onUnauthorized === 'function') {
    onUnauthorized();
  }

  // Remove auth token
  removeAuthToken();

  // Redirect if enabled
  if (redirect) {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      redirectToLogin();
    }
  }
};

/**
 * Check if user is authenticated and has required role
 * @param {Object} user - The user object from context
 * @param {string|Array} requiredRole - Required role(s) to check against
 * @returns {Object} Object with isAuthorized and redirectPath properties
 */
export const checkAuthAndRole = (user, requiredRole) => {
  // If no user is logged in
  if (!user) {
    return {
      isAuthorized: false,
      redirectPath: '/login?redirect=' + encodeURIComponent(window.location.pathname),
    };
  }

  // If no specific role required, any authenticated user is authorized
  if (!requiredRole) {
    return { isAuthorized: true, redirectPath: null };
  }

  // Convert requiredRole to array if it's a string
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => user.role === role);

  if (!hasRequiredRole) {
    return {
      isAuthorized: false,
      redirectPath: '/', // Redirect to home or access denied page
    };
  }

  return { isAuthorized: true, redirectPath: null };
};
