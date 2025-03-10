// controllers/content.controller.js - Content generation controller
const { createClient } = require('@supabase/supabase-js');
const aiService = require('../services/ai.service');
const dotenv = require('dotenv');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate product description
 * @route POST /api/content/generate/description
 * @access Private
 */
exports.generateDescription = async (req, res) => {
  try {
    console.log('\n=== Content Generation Request ===');
    console.log('Raw request body:', req.body);
    
    // Extract nested data
    const productData = req.body.productData || {};
    const options = req.body.options || {};
    
    // Validate required fields
    if (!productData.productName?.trim()) {
      console.log('❌ Validation failed: Empty product name');
      console.log('Product name received:', productData.productName);
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    const processedData = {
      productName: productData.productName.trim(),
      productCategory: productData.productCategory?.trim() || '',
      productFeatures: Array.isArray(productData.productFeatures) ? productData.productFeatures.filter(f => f) : [],
      targetAudience: productData.targetAudience?.trim() || '',
      keywords: Array.isArray(productData.keywords) ? productData.keywords.filter(k => k) : [],
      additionalInfo: productData.additionalInfo?.trim() || ''
    };

    const processedOptions = {
      tone: options.tone || 'professional',
      style: options.style || 'balanced',
      length: options.length || 'medium'
    };

    console.log('\n=== Processed Data ===');
    console.log('Product Data:', processedData);
    console.log('Options:', processedOptions);

    const result = await aiService.generateProductDescription(processedData, processedOptions);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('\n=== Generation Error ===');
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate description'
    });
  }
};

/**
 * Generate product title
 * @route POST /api/content/generate/title
 * @access Private
 */
exports.generateTitle = async (req, res) => {
  try {
    console.log('Handling product title generation request...');
    const { productData, options } = req.body;
    
    // Validate input
    if (!productData || !productData.productName) {
      console.log('Generation failed: Missing product name');
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }
    
    // Get user profile for brand voice settings
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('brand_voice')
      .eq('id', req.user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }
    
    const brandVoice = profile?.brand_voice || { tone: 'professional', style: 'balanced' };
    
    // Merge brand voice settings with provided options
    const generationOptions = {
      style: options?.style || brandVoice.style,
      ...options
    };
    
    // Generate title using AI service
    const result = await aiService.generateProductTitle(
      productData,
      generationOptions
    );
    
    // Update user's usage stats
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        usage: {
          contentGenerated: supabase.rpc('increment', { x: 1, field: 'usage.contentGenerated' }),
          apiCalls: supabase.rpc('increment', { x: 1, field: 'usage.apiCalls' }),
          lastUsed: new Date()
        }
      })
      .eq('id', req.user.id);
    
    if (updateError) {
      console.error('Error updating usage stats:', updateError);
    }
    
    console.log(`✅ Title generated for user: ${req.user.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Product title generated successfully',
      data: {
        content: result.text,
        metadata: result.metadata
      }
    });
  } catch (error) {
    console.error('❌ Generate title error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate product title',
      error: error.message
    });
  }
};

/**
 * Generate alternatives for existing content
 * @route POST /api/content/generate/alternatives
 * @access Private
 */
exports.generateAlternatives = async (req, res) => {
  try {
    console.log('Handling content alternatives generation request...');
    const { originalContent, instructions } = req.body;
    
    // Validate input
    if (!originalContent) {
      console.log('Generation failed: Missing original content');
      return res.status(400).json({
        success: false,
        message: 'Original content is required'
      });
    }
    
    // Generate alternatives using AI service
    const result = await aiService.generateAlternatives(
      originalContent,
      instructions || 'Make it more engaging and persuasive'
    );
    
    // Update user's usage stats
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        usage: {
          contentGenerated: supabase.rpc('increment', { x: 1, field: 'usage.contentGenerated' }),
          apiCalls: supabase.rpc('increment', { x: 1, field: 'usage.apiCalls' }),
          lastUsed: new Date()
        }
      })
      .eq('id', req.user.id);
    
    if (updateError) {
      console.error('Error updating usage stats:', updateError);
    }
    
    console.log(`✅ Alternatives generated for user: ${req.user.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Content alternatives generated successfully',
      data: {
        content: result.text,
        metadata: result.metadata
      }
    });
  } catch (error) {
    console.error('❌ Generate alternatives error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content alternatives',
      error: error.message
    });
  }
};

/**
 * Save generated content
 * @route POST /api/content/save
 * @access Private
 */
exports.saveContent = async (req, res) => {
  try {
    console.log('Saving generated content...');
    const {
      title,
      contentType,
      originalInput,
      generationParameters,
      generatedContent,
      metadata
    } = req.body;
    
    // Validate input
    if (!title || !generatedContent || !generatedContent.text) {
      console.log('Save failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Title and generated content are required'
      });
    }
    
    // Create content record in Supabase
    const { data, error } = await supabase
      .from('content')
      .insert({
        user_id: req.user.id,
        title,
        content_type: contentType || 'product-description',
        original_input: originalInput || {},
        generation_parameters: generationParameters || {},
        generated_content: {
          text: generatedContent.text,
          versions: [{
            text: generatedContent.text,
            created_at: new Date(),
            feedback: null
          }]
        },
        metadata: metadata || {},
        status: 'draft'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving content:', error);
      throw error;
    }
    
    console.log(`✅ Content saved successfully: ${data.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Content saved successfully',
      data: {
        content: data
      }
    });
  } catch (error) {
    console.error('❌ Save content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save content',
      error: error.message
    });
  }
};

/**
 * Get all content for a user
 * @route GET /api/content
 * @access Private
 */
exports.getUserContent = async (req, res) => {
  try {
    console.log('Getting user content...');
    
    // Query parameters for filtering and pagination
    const { contentType, status, page = 1, limit = 10, sort = 'created_at.desc' } = req.query;
    
    // Calculate pagination
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;
    
    // Build query
    let query = supabase
      .from('content')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .range(from, to);
    
    // Add filters if provided
    if (contentType) {
      query = query.eq('content_type', contentType);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    // Add sorting
    const [sortField, sortDirection] = sort.split('.');
    query = query.order(sortField, { ascending: sortDirection === 'asc' });
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error retrieving content:', error);
      throw error;
    }
    
    console.log(`✅ Retrieved ${data.length} content items for user: ${req.user.email}`);
    
    res.status(200).json({
      success: true,
      count: data.length,
      total: count,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        pageSize: parseInt(limit)
      },
      data: {
        content: data
      }
    });
  } catch (error) {
    console.error('❌ Get user content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve content',
      error: error.message
    });
  }
};

/**
 * Get a specific content by ID
 * @route GET /api/content/:id
 * @access Private
 */
exports.getContentById = async (req, res) => {
  try {
    console.log(`Getting content ID: ${req.params.id}...`);
    
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        console.log('Get content failed: Content not found');
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }
      throw error;
    }
    
    console.log(`✅ Retrieved content: ${data.id}`);
    
    res.status(200).json({
      success: true,
      data: {
        content: data
      }
    });
  } catch (error) {
    console.error('❌ Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve content',
      error: error.message
    });
  }
};

/**
 * Update content
 * @route PUT /api/content/:id
 * @access Private
 */
exports.updateContent = async (req, res) => {
  try {
    console.log(`Updating content ID: ${req.params.id}...`);
    
    const {
      title,
      status,
      generatedContent
    } = req.body;
    
    // First, get current content
    const { data: currentContent, error: getError } = await supabase
      .from('content')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    
    if (getError) {
      if (getError.code === 'PGRST116') {
        // No rows returned
        console.log('Update failed: Content not found');
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }
      throw getError;
    }
    
    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title;
    if (status) updateData.status = status;
    
    // If new content text is provided, add a new version
    if (generatedContent && generatedContent.text) {
      const newVersions = [
        ...(currentContent.generated_content.versions || []),
        {
          text: generatedContent.text,
          created_at: new Date(),
          feedback: null
        }
      ];
      
      updateData.generated_content = {
        ...currentContent.generated_content,
        text: generatedContent.text,
        versions: newVersions
      };
    }
    
    updateData.updated_at = new Date();
    
    // Update content
    const { data, error } = await supabase
      .from('content')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating content:', error);
      throw error;
    }
    
    console.log(`✅ Content updated: ${data.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: {
        content: data
      }
    });
  } catch (error) {
    console.error('❌ Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content',
      error: error.message
    });
  }
};

/**
 * Add feedback to content
 * @route POST /api/content/:id/feedback
 * @access Private
 */
exports.addFeedback = async (req, res) => {
  try {
    console.log(`Adding feedback to content ID: ${req.params.id}...`);
    
    const { rating, comments } = req.body;
    
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      console.log('Feedback failed: Invalid rating');
      return res.status(400).json({
        success: false,
        message: 'Rating is required and must be between 1 and 5'
      });
    }
    
    // First, get current content
    const { data: currentContent, error: getError } = await supabase
      .from('content')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    
    if (getError) {
      if (getError.code === 'PGRST116') {
        console.log('Feedback failed: Content not found');
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }
      throw getError;
    }
    
    // Check if there are versions
    if (!currentContent.generated_content.versions || 
        currentContent.generated_content.versions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No versions found to update feedback'
      });
    }
    
    // Add feedback to latest version
    const versions = [...currentContent.generated_content.versions];
    const latestVersionIndex = versions.length - 1;
    versions[latestVersionIndex].feedback = { rating, comments: comments || '' };
    
    // Update content
    const { data, error } = await supabase
      .from('content')
      .update({
        generated_content: {
          ...currentContent.generated_content,
          versions
        },
        updated_at: new Date()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
    
    console.log(`✅ Feedback added to content: ${data.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Feedback added successfully',
      data: {
        content: data
      }
    });
  } catch (error) {
    console.error('❌ Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add feedback',
      error: error.message
    });
  }
};

/**
 * Delete content
 * @route DELETE /api/content/:id
 * @access Private
 */
exports.deleteContent = async (req, res) => {
  try {
    console.log(`Deleting content ID: ${req.params.id}...`);
    
    // Check if content exists and belongs to user
    const { data: checkData, error: checkError } = await supabase
      .from('content')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log('Delete failed: Content not found');
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }
      throw checkError;
    }
    
    // Delete content
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    
    if (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
    
    console.log(`✅ Content deleted: ${req.params.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content',
      error: error.message
    });
  }
};