// Authentication utility functions
import axios from 'axios';

// Set up axios interceptor to include JWT token in requests
export const setupAxiosInterceptors = () => {
  // Add request interceptor to include token
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Only redirect if we're not on a login/auth page
        const currentPath = window.location.pathname;
        const authPages = ['/signin', '/register', '/forgot-password'];
        
        if (!authPages.includes(currentPath)) {
          // Token expired or invalid - redirect only from protected pages
          logout();
          window.location.href = '/signin';
        }
      }
      return Promise.reject(error);
    }
  );
};

// Get token from localStorage
export const getToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }
    return token;
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    localStorage.removeItem('token');
    return null;
  }
};

// Get user data from localStorage
export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined' || user === 'null') {
      return null;
    }
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('user');
    return null;
  }
};

// Decode JWT token and extract user information
export const decodeToken = (token) => {
  try {
    if (!token) {
      return null;
    }
    
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT token structure');
      return null;
    }
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

// Extract user information from token
export const getUserInfoFromToken = (token) => {
  try {
    const payload = decodeToken(token);
    if (!payload) {
      return null;
    }
    
    // Extract user information from the token payload
    const userInfo = {
      id: payload.userId || payload.sub,
      email: payload.sub || payload.email,
      fullName: payload.fullName || payload.name,
      role: payload.role,
      organization: payload.organization,
      experience: payload.experience,
      exp: payload.exp,
      iat: payload.iat
    };
    
    return userInfo;
  } catch (error) {
    console.error('Error extracting user info from token:', error);
    return null;
  }
};

// Get current user information (from token or localStorage)
export const getCurrentUser = () => {
  try {
    const token = getToken();
    if (token) {
      // Extract user info from token (most up-to-date)
      const userFromToken = getUserInfoFromToken(token);
      if (userFromToken) {
        return userFromToken;
      }
    }
    
    // Fallback to localStorage user data
    return getUser();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  try {
    const token = getToken();
    if (!token) {
      return false;
    }
    
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid JWT token structure');
      logout(); // Clear invalid token
      return false;
    }
    
    // Decode JWT to check expiration (basic check)
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp < currentTime) {
      console.warn('JWT token has expired');
      logout(); // Clear expired token
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    logout(); // Clear corrupted data
    return false;
  }
};

// Logout function
export const logout = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Logout successful');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

// Clear all auth data (useful for debugging)
export const clearAuthData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Auth data cleared');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Login function (store token and user data)
export const login = (token, user) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }
    
    localStorage.setItem('token', token);
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    console.log('Login successful:', { hasToken: !!token, hasUser: !!user });
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};
