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
      if (session && session.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log(`✅ Adding auth token to ${config.url}`);
      } else {
        console.warn(`⚠️ No auth token available for request to ${config.url}`);
        
        // Try to refresh the session if it exists but token is missing
        if (session) {
          console.log('Session exists but no token - attempting refresh');
          const { data, error } = await supabase.auth.refreshSession();
          
          if (!error && data.session) {
            console.log('Session refreshed successfully, adding new token');
            config.headers.Authorization = `Bearer ${data.session.access_token}`;
          } else {
            console.error('Failed to refresh session:', error);
          }
        } else {
          // If no session at all, redirect to login
          console.warn('No active session found - redirecting to login');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
            throw new Error('Authentication required - redirecting to login');
          }
        }
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
      console.log('🔐 Authentication error - checking session status');
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session and got 401, redirect to login
        console.log('🔑 No active session found - redirecting to login');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        // If has session but got 401, try to refresh token
        console.log('🔄 Session exists but token may be expired - attempting refresh');
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !data.session) {
          // If refresh failed, sign out and redirect
          console.log('❌ Token refresh failed - signing out');
          await supabase.auth.signOut();
          window.location.href = '/login';
        } else {
          // If refresh succeeded, retry the request
          console.log('✅ Token refreshed successfully - retrying request');
          return api(error.config);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;