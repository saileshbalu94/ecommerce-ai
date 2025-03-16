import axios from 'axios';
import supabase from './supabase';

const brandVoiceService = {
  getBrandVoices: async () => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await axios.get('/api/brand-voices', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching brand voices:', error);
      throw error;
    }
  },

  createBrandVoice: async (brandVoiceData) => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await axios.post('/api/brand-voices', brandVoiceData, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating brand voice:', error);
      throw error;
    }
  },

  updateBrandVoice: async (id, brandVoiceData) => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await axios.put(`/api/brand-voices/${id}`, brandVoiceData, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error updating brand voice:', error);
      throw error;
    }
  },

  deleteBrandVoice: async (id) => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await axios.delete(`/api/brand-voices/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error deleting brand voice:', error);
      throw error;
    }
  },

  getBrandVoiceById: async (id) => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await axios.get(`/api/brand-voices/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching brand voice:', error);
      throw error;
    }
  }
};

export default brandVoiceService; 