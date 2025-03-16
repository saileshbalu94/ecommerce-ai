// controllers/content.controller.js - Content generation controller
const { createClient } = require('@supabase/supabase-js');
const aiService = require('../services/ai.service');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: function (req, file, cb) {
    // Accept images and PDFs only
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'), false);
    }
  }
});

// Helper function to upload file to Supabase Storage
const uploadFileToSupabase = async (filePath, userId) => {
  try {
    const filename = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);
    const fileBuffer = await streamToBuffer(fileStream);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('product-images')
      .upload(`${userId}/${filename}`, fileBuffer, {
        contentType: getMimeType(filePath),
        upsert: true
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(`${userId}/${filename}`);
    
    // Clean up local file
    fs.unlinkSync(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    throw error;
  }
};

// Helper to convert stream to buffer
const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

// Helper to get MIME type from file path
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Generate product description
 * @route POST /api/content/generate/description
 * @access Private
 */
exports.generateDescription = [
  // Handle file upload
  upload.single('productImage'),
  
  // Process request after file upload
  async (req, res) => {
    try {
      console.log('\n=== Content Generation Request ===');
      
      // Parse productData and options from form data or JSON body
      let productData, options;
      
      if (req.file) {
        // Request with file upload - data is in form fields
        console.log('Processing request with file upload');
        productData = JSON.parse(req.body.productData || '{}');
        options = JSON.parse(req.body.options || '{}');
        
        // Upload file to Supabase storage
        const imageUrl = await uploadFileToSupabase(req.file.path, req.user.id);
        productData.productImage = imageUrl;
        
        console.log('File uploaded successfully:', imageUrl);
      } else {
        // Regular JSON request
        console.log('Processing regular JSON request');
        productData = req.body.productData || {};
        options = req.body.options || {};
      }
      
      console.log('Product Data:', productData);
      console.log('Options:', options);
      
      // Remove validation for product name since it's now optional
      
      const processedData = {
        productName: productData.productName?.trim() || '',
        productCategory: productData.productCategory?.trim() || '',
        productFeatures: Array.isArray(productData.productFeatures) ? productData.productFeatures.filter(f => f) : [],
        targetAudience: productData.targetAudience?.trim() || '',
        keywords: Array.isArray(productData.keywords) ? productData.keywords.filter(k => k) : [],
        additionalInfo: productData.additionalInfo?.trim() || '',
        productImage: productData.productImage || null // Include the image URL if uploaded
      };
      
      const processedOptions = {
        tone: options.tone || 'professional',
        style: options.style || 'balanced',
        length: options.length || 'medium'
      };
      
      // If a brand voice ID is provided, fetch the brand voice
      if (options.brandVoiceId) {
        console.log(`\n=== Fetching Brand Voice ===`);
        console.log('Brand Voice ID:', options.brandVoiceId);
        
        try {
          const { data: brandVoice, error } = await supabase
            .from('brand_voices')
            .select('*')
            .eq('id', options.brandVoiceId)
            .eq('user_id', req.user.id)
            .single();
          
          if (error) {
            console.log('❌ Error fetching brand voice:', error);
          } else if (brandVoice) {
            console.log('✅ Brand voice found:', brandVoice.name);
            
            // Add brand voice information to options
            processedOptions.brandVoiceId = brandVoice.id;
            
            // Override tone and style if available in the brand voice
            if (brandVoice.tone?.primary) {
              processedOptions.tone = brandVoice.tone.primary;
            }
            
            if (brandVoice.style?.type) {
              processedOptions.style = brandVoice.style.type;
            }
            
            // Add vocabulary to the processed data if available
            if (brandVoice.vocabulary?.keyPhrases?.length > 0) {
              processedData.keyPhrases = brandVoice.vocabulary.keyPhrases;
            }
            
            if (brandVoice.vocabulary?.powerWords?.length > 0) {
              processedData.powerWords = brandVoice.vocabulary.powerWords;
            }
            
            if (brandVoice.vocabulary?.avoidWords?.length > 0) {
              processedData.avoidWords = brandVoice.vocabulary.avoidWords;
            }
          }
        } catch (error) {
          console.log('❌ Error processing brand voice:', error);
        }
      }
  
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
  }
];

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
    const { contentId, feedback } = req.body;
    const userId = req.user.id;
    
    console.log("Generate alternatives request:", { contentId, feedback });
    
    if (!contentId) {
      return res.status(400).json({ message: 'Content ID is required' });
    }
    
    console.log('Handling content alternatives generation request...');
    
    // Get the original content from Supabase
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', contentId)
      .eq('user_id', userId)
      .single();
    
    if (error || !content) {
      console.error('Error fetching content:', error);
      return res.status(404).json({ message: 'Content not found' });
    }
    
    console.log('Generating content alternatives...');
    
    // Extract the actual content text from the content object
    const originalContentText = content.generated_content?.text || content.generated_content || '';
    console.log('Original content type:', typeof originalContentText);
    console.log('Original content length:', originalContentText.length);
    console.log('Feedback:', feedback);
    
    // Call the AI service with the feedback
    const result = await aiService.generateAlternatives(originalContentText, feedback);
    
    // Update the content in Supabase with the new alternative
    // First, check if we need to create a conversation field
    let conversation = content.conversation || [];
    
    // If no conversation exists, create initial structure from existing content
    if (conversation.length === 0) {
      conversation = [
        {
          type: 'system',
          content: content.generated_content,
          timestamp: content.created_at,
          metadata: content.metadata
        }
      ];
    }
    
    // Add the user feedback and AI response to the conversation
    conversation.push(
      {
        type: 'user',
        content: feedback,
        timestamp: new Date().toISOString()
      },
      {
        type: 'system',
        content: result.text,
        timestamp: new Date().toISOString(),
        metadata: result.metadata
      }
    );
    
    // Update the content in Supabase
    const { error: updateError } = await supabase
      .from('content')
      .update({
        conversation: conversation,
        alternatives: [...(content.alternatives || []), result.text],
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);
    
    if (updateError) {
      console.error('Error updating content with alternatives:', updateError);
      return res.status(500).json({ message: 'Failed to save content alternatives' });
    }
    
    // Return the generated alternative
    res.json(result);
  } catch (error) {
    console.error('❌ Generate alternatives error:', error);
    res.status(500).json({ message: `Failed to generate content alternatives: ${error.message}` });
  }
};

/**
 * Save generated content
 * @route POST /api/content/save
 * @access Private
 */
exports.saveContent = [
  // Handle file upload
  upload.single('productImage'),
  
  // Process request after file upload
  async (req, res) => {
    try {
      console.log('Saving generated content...');
      
      let contentData;
      
      if (req.file) {
        // Request with file upload
        console.log('Processing content save with file upload');
        contentData = JSON.parse(req.body.contentData || '{}');
        
        // Upload file to Supabase storage
        const imageUrl = await uploadFileToSupabase(req.file.path, req.user.id);
        
        // Add image URL to original input
        if (!contentData.originalInput) {
          contentData.originalInput = {};
        }
        contentData.originalInput.productImage = imageUrl;
        
        console.log('File uploaded successfully:', imageUrl);
      } else {
        // Regular JSON request
        contentData = req.body;
      }
      
      const {
        title,
        contentType,
        originalInput,
        generationParameters,
        generatedContent,
        metadata
      } = contentData;
      
      console.log('Content data to save:', contentData);

      // Validate input
      if (!generatedContent || !generatedContent.text) {
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
  }
];

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
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;
    
    // Set the updated timestamp
    updates.updated_at = new Date().toISOString();
    
    // Update the content in Supabase
    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating content:', error);
      return res.status(500).json({ message: 'Failed to update content' });
    }
    
    if (!data) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('❌ Update content error:', error);
    res.status(500).json({ message: `Failed to update content: ${error.message}` });
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

// Function to generate alternative content directly from AI without saved content
exports.generateAIAlternatives = async (req, res) => {
  try {
    const { originalContent, feedback } = req.body;
    
    // Log request details
    console.log('Generating AI alternatives directly...');
    console.log('Original content type:', typeof originalContent);
    console.log('Original content length:', originalContent?.length || 0);
    console.log('Feedback:', feedback);
    
    // Validate content
    if (!originalContent) {
      return res.status(400).json({ message: 'Original content is required' });
    }
    
    // Call the AI service directly with the content text and feedback
    const result = await aiService.generateAlternatives(originalContent, feedback);
    
    // Return the generated alternative
    res.json(result);
  } catch (error) {
    console.error('❌ Generate AI alternatives error:', error);
    res.status(500).json({ message: `Failed to generate alternatives: ${error.message}` });
  }
};