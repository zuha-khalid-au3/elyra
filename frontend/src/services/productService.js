import api from './api';
import { handleApiError } from '../utils/errorHandler';

// Get all products
export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, {
      onUnauthorized: () => {
        // Handle unauthorized access (e.g., token expired)
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      },
    });
    throw new Error(errorMessage);
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, {
      onUnauthorized: () => {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      },
    });
    throw new Error(errorMessage);
  }
};

// Create a new product (admin only)
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, {
      onUnauthorized: () => {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      },
      onForbidden: () => {
        // Handle case where user doesn't have admin privileges
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      },
    });
    throw new Error(errorMessage);
  }
};

// Update a product (admin only)
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, {
      onUnauthorized: () => {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      },
      onForbidden: () => {
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      },
    });
    throw new Error(errorMessage);
  }
};

// Delete a product (admin only)
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, {
      onUnauthorized: () => {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      },
      onForbidden: () => {
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      },
    });
    throw new Error(errorMessage);
  }
};

// Get products by category
export const getProductsByCategory = async (category) => {
  try {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, {
      onUnauthorized: () => {
        // For category pages, we might not want to redirect to login
        // as they might be public pages
        console.warn('Unauthorized access to category page');
      },
    });
    
    // For category pages, we might want to return an empty array instead of throwing
    // to prevent the page from breaking completely
    if (error.response?.status === 404) {
      return [];
    }
    
    throw new Error(errorMessage);
  }
};

// Search products
export const searchProducts = async (query) => {
  try {
    const response = await api.get('/products/search', { params: { q: query } });
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, {
      onUnauthorized: () => {
        // Search might be a public feature, so we might not want to redirect
        console.warn('Unauthorized search attempt');
      },
    });
    
    // Return empty results on error to prevent UI breakage
    if (error.response?.status !== 401) {
      return [];
    }
    
    throw new Error(errorMessage);
  }
};
