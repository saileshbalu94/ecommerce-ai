import axios from 'axios';
import supabase from './supabase';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      // If session exists, add access token to headers
      if (session) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error adding auth token to request:', error);
      return config;
    }
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API response error:', error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session and got 401, redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        // If has session but got 401, try to refresh token
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !data.session) {
          // If refresh failed, sign out and redirect
          await supabase.auth.signOut();
          window.location.href = '/login';
        } else {
          // If refresh succeeded, retry the request
          return api(error.config);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;