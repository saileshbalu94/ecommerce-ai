import api from './api';
import axios from 'axios';
import supabase from './supabase';

/**
 * Content generation and management service
 */
const contentService = {
  /**
   * Generate product description
   * @param {Object} productData - Information about the product
   * @param {Object} options - Generation options
   * @returns {Promise} - Generated content
   */
  generateDescription: async (productData, options) => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await axios.post('/api/content/generate/description', 
        {
          productData,
          options
        },
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: {
          content: response.data.data.text,
          metadata: response.data.data.metadata
        }
      };
    } catch (error) {
      console.error('Content service error:', error);
      throw error;
    }
  },
  
  /**
   * Generate product title
   * @param {Object} productData - Information about the product
   * @param {Object} options - Generation options
   * @returns {Promise} - Generated titles
   */
  generateTitle: async (productData, options = {}) => {
    try {
      console.log('Generating product title...');
      console.log('Product data:', productData);
      console.log('Options:', options);
      
      const response = await api.post('/content/generate/title', {
        productData,
        options
      });
      
      console.log('✅ Title generated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Generate title error:', error);
      throw error;
    }
  },
  
  /**
   * Generate alternatives for existing content
   * @param {String} originalContent - Original content
   * @param {String} instructions - Instructions for alternatives
   * @returns {Promise} - Generated alternatives
   */
  generateAlternatives: async (originalContent, instructions) => {
    try {
      console.log('Generating content alternatives...');
      
      const response = await api.post('/content/generate/alternatives', {
        originalContent,
        instructions
      });
      
      console.log('✅ Alternatives generated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Generate alternatives error:', error);
      throw error;
    }
  },
  
  /**
   * Save generated content
   * @param {Object} contentData - Content data to save
   * @returns {Promise} - Saved content
   */
  saveContent: async (contentData) => {
    try {
      console.log('Saving content...');
      
      const response = await api.post('/content/save', contentData);
      
      console.log('✅ Content saved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Save content error:', error);
      throw error;
    }
  },
  
  /**
   * Get all content for current user
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} - List of content
   */
  getUserContent: async (params = {}) => {
    try {
      console.log('Getting user content...');
      
      const response = await api.get('/content', { params });
      
      console.log(`✅ Retrieved ${response.data.count} content items`);
      return response.data;
    } catch (error) {
      console.error('❌ Get user content error:', error);
      throw error;
    }
  },
  
  /**
   * Get content by ID
   * @param {String} id - Content ID
   * @returns {Promise} - Content details
   */
  getContentById: async (id) => {
    try {
      console.log(`Getting content ID: ${id}...`);
      
      const response = await api.get(`/content/${id}`);
      
      console.log('✅ Content retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Get content error:', error);
      throw error;
    }
  },
  
  /**
   * Update content
   * @param {String} id - Content ID
   * @param {Object} contentData - Updated content data
   * @returns {Promise} - Updated content
   */
  updateContent: async (id, contentData) => {
    try {
      console.log(`Updating content ID: ${id}...`);
      
      const response = await api.put(`/content/${id}`, contentData);
      
      console.log('✅ Content updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Update content error:', error);
      throw error;
    }
  },
  
  /**
   * Add feedback to content
   * @param {String} id - Content ID
   * @param {Number} rating - Rating (1-5)
   * @param {String} comments - Feedback comments
   * @returns {Promise} - Updated content with feedback
   */
  addFeedback: async (id, rating, comments) => {
    try {
      console.log(`Adding feedback to content ID: ${id}...`);
      
      const response = await api.post(`/content/${id}/feedback`, {
        rating,
        comments
      });
      
      console.log('✅ Feedback added successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Add feedback error:', error);
      throw error;
    }
  },
  
  /**
   * Delete content
   * @param {String} id - Content ID
   * @returns {Promise} - Delete confirmation
   */
  deleteContent: async (id) => {
    try {
      console.log(`Deleting content ID: ${id}...`);
      
      const response = await api.delete(`/content/${id}`);
      
      console.log('✅ Content deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Delete content error:', error);
      throw error;
    }
  }
};

export default contentService;