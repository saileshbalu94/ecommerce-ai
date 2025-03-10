import api from '../services/api';

const TOKEN_KEY = 'token';

/**
 * Set authentication token in local storage and axios headers
 * @param {String} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    // Store token in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    
    // Set token in axios headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    console.log('✅ Auth token set successfully');
  } else {
    console.warn('⚠️ No token provided to setAuthToken');
  }
};

/**
 * Remove authentication token from local storage and axios headers
 */
export const removeAuthToken = () => {
  // Remove token from localStorage
  localStorage.removeItem(TOKEN_KEY);
  
  // Remove token from axios headers
  delete api.defaults.headers.common['Authorization'];
  
  console.log('✅ Auth token removed successfully');
};

/**
 * Get authentication token from local storage
 * @returns {String|null} - JWT token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if token is expired
 * @param {String} token - JWT token
 * @returns {Boolean} - Whether token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // JWT tokens are in format: header.payload.signature
    const payload = token.split('.')[1];
    
    // Decode payload (base64)
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    
    return decodedPayload.exp < currentTime;
  } catch (error) {
    console.error('❌ Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get user role from token
 * @returns {String} - User role (user, admin)
 */
export const getUserRole = () => {
  const token = getAuthToken();
  
  if (!token) return null;
  
  try {
    // Get payload from token
    const payload = token.split('.')[1];
    
    // Decode payload
    const decodedPayload = JSON.parse(atob(payload));
    
    return decodedPayload.role;
  } catch (error) {
    console.error('❌ Error getting user role:', error);
    return null;
  }
};

/**
 * Check if user has admin role
 * @returns {Boolean} - Whether user is admin
 */
export const isAdmin = () => {
  return getUserRole() === 'admin';
};