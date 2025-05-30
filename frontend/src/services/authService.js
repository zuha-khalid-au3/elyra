import api from './api';
import { handleApiError } from '../utils/errorHandler';

// Register user
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, {
      onUnauthorized: () => {
        // Clear token if unauthorized
        localStorage.removeItem('token');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      },
    });
    
    // Re-throw with user-friendly message
    throw new Error(errorMessage);
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    // Clear token if unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    // Re-throw with user-friendly message
    throw new Error(errorMessage);
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    // Clear token if unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    // Re-throw with user-friendly message
    throw new Error(errorMessage);
  }
};

// Logout user
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get auth token
export const getToken = () => {
  return localStorage.getItem('token');
};
