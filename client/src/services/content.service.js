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
      // Create a FormData object if there's an image
      let requestData;

      if (productData.productImage) {
        // Use FormData for image upload
        const formData = new FormData();
        formData.append('productImage', productData.productImage);
        
        // Convert productData and options to JSON and append to FormData
        formData.append('productData', JSON.stringify({
          ...productData,
          productImage: null // Remove the actual file object from the JSON
        }));
        formData.append('options', JSON.stringify(options));
        
        requestData = formData;
        // Don't set Content-Type, let axios set it with the boundary
        
        // For FormData, we need to use axios directly but the api interceptor
        // will still add the auth token
        const response = await api.post('/content/generate/description', requestData);

        return {
          success: true,
          data: {
            content: response.data.data.text,
            metadata: response.data.data.metadata
          }
        };
      } else {
        // Regular JSON request without image
        requestData = {
          productData,
          options
        };
        
        const response = await api.post('/content/generate/description', requestData);

        return {
          success: true,
          data: {
            content: response.data.data.text,
            metadata: response.data.data.metadata
          }
        };
      }
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
   * @param {String} contentId - Content ID
   * @param {String} feedback - Feedback for alternatives
   * @returns {Promise} - Generated alternatives
   */
  generateAlternatives: async (contentId, feedback) => {
    console.log('Generating content alternatives...', { contentId, feedback });
    
    try {
      const response = await api.post('/content/generate/alternatives', {
        contentId,
        feedback
      });
      
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

      // Handle image upload if present
      if (contentData.originalInput && contentData.originalInput.productImage) {
        // Create FormData for image upload
        const formData = new FormData();
        formData.append('productImage', contentData.originalInput.productImage);
        
        // Convert contentData to JSON and append to FormData (excluding the actual file)
        const contentDataCopy = {
          ...contentData,
          originalInput: {
            ...contentData.originalInput,
            productImage: null // Remove the file object from JSON
          }
        };
        formData.append('contentData', JSON.stringify(contentDataCopy));
        
        const response = await api.post('/content/save', formData);
        
        console.log('✅ Content saved successfully');
        return response.data;
      } else {
        // Regular JSON request without image
        const response = await api.post('/content/save', contentData);
        
        console.log('✅ Content saved successfully');
        return response.data;
      }
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
      
      // Ensure we use contentService instead of direct API call to ensure consistent endpoint handling
      const response = await api.get(`/content/${id}`);
      
      // Debug logging to understand response structure
      console.log('Content details API response structure:', {
        responseStructure: Object.keys(response),
        dataStructure: response.data ? Object.keys(response.data) : 'no data key',
        nestedDataStructure: response.data?.data ? Object.keys(response.data.data) : 'no nested data key',
        contentStructure: response.data?.data?.content ? Object.keys(response.data.data.content) : 'no content key'
      });

      // Process the API response to extract the content
      let processedResponse;
      
      if (response.data && response.data.data && response.data.data.content) {
        // Handle nested structure where content is in response.data.data.content
        processedResponse = {
          success: true,
          data: {
            content: response.data.data.content
          }
        };
      } else if (response.data && response.data.data) {
        // Handle structure where content is in response.data.data
        processedResponse = {
          success: true,
          data: response.data.data
        };
      } else if (response.data && response.data.success) {
        // Already has the expected structure
        processedResponse = response.data;
      } else {
        // Fallback to returning the whole data object
        processedResponse = {
          success: true,
          data: {
            content: response.data
          }
        };
      }
      
      console.log('✅ Content retrieved successfully');
      console.log('Processed response:', processedResponse);
      return processedResponse;
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
   * @returns {Promise} - Updated content
   */
  addFeedback: async (id, rating, comments = '') => {
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
   * @returns {Promise} - Deletion status
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