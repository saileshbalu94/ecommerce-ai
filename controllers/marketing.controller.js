// controllers/marketing.controller.js - Marketing campaigns controller
const { supabase } = require('../services/supabaseClient');
const { asyncHandler } = require('../middleware/async.middleware');

/**
 * @desc    Create a new marketing campaign
 * @route   POST /api/marketing/campaigns
 * @access  Private
 */
const createCampaign = asyncHandler(async (req, res) => {
  const {
    name,
    product_name,
    description,
    industry,
    campaign_objective,
    target_audience,
    unique_selling_points,
    key_benefits,
    key_features,
    value_proposition,
    special_offers,
    price_point,
    primary_keywords,
    secondary_keywords,
    brand_terms,
    competitor_terms,
    negative_keywords,
    cta,
    landing_page_url,
    display_path,
    tracking_parameters,
    channel_type,
    brand_voice_id,
    use_brand_voice,
    tone_override
  } = req.body;

  // Validate required fields
  if (!name || !description || !campaign_objective || !landing_page_url || !channel_type) {
    res.status(400);
    throw new Error('Please provide all required fields: name, description, campaign_objective, landing_page_url, channel_type');
  }

  // Create the campaign
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .insert([
      {
        user_id: req.user.id,
        name,
        product_name,
        description,
        industry,
        campaign_objective,
        target_audience,
        unique_selling_points,
        key_benefits,
        key_features,
        value_proposition,
        special_offers,
        price_point,
        primary_keywords,
        secondary_keywords,
        brand_terms,
        competitor_terms,
        negative_keywords,
        cta,
        landing_page_url,
        display_path,
        tracking_parameters,
        channel_type,
        brand_voice_id,
        use_brand_voice,
        tone_override
      }
    ])
    .select();

  if (error) {
    console.error('Error creating campaign:', error);
    res.status(400);
    throw new Error('Could not create marketing campaign');
  }

  res.status(201).json({
    success: true,
    data: data[0]
  });
});

/**
 * @desc    Get all marketing campaigns for a user (with optional filtering)
 * @route   GET /api/marketing/campaigns
 * @access  Private
 */
const getCampaigns = asyncHandler(async (req, res) => {
  const { channel_type } = req.query;
  
  let query = supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('user_id', req.user.id);
  
  // Apply channel type filter if provided
  if (channel_type) {
    query = query.eq('channel_type', channel_type);
  }
  
  // Order by creation date, newest first
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching campaigns:', error);
    res.status(400);
    throw new Error('Could not retrieve marketing campaigns');
  }
  
  res.status(200).json({
    success: true,
    count: data.length,
    data
  });
});

/**
 * @desc    Get a specific marketing campaign by ID
 * @route   GET /api/marketing/campaigns/:id
 * @access  Private
 */
const getCampaignById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();
  
  if (error) {
    console.error('Error fetching campaign:', error);
    res.status(404);
    throw new Error('Marketing campaign not found');
  }
  
  res.status(200).json({
    success: true,
    data
  });
});

/**
 * @desc    Update a marketing campaign
 * @route   PUT /api/marketing/campaigns/:id
 * @access  Private
 */
const updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // First, check if the campaign exists and belongs to the user
  const { data: existingCampaign, error: fetchError } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();
  
  if (fetchError) {
    console.error('Error fetching campaign to update:', fetchError);
    res.status(404);
    throw new Error('Marketing campaign not found or you do not have permission to update it');
  }
  
  // Update the campaign
  const { data, error } = await supabase
    .from('marketing_campaigns')
    .update(req.body)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating campaign:', error);
    res.status(400);
    throw new Error('Could not update marketing campaign');
  }
  
  res.status(200).json({
    success: true,
    data: data[0]
  });
});

/**
 * @desc    Delete a marketing campaign
 * @route   DELETE /api/marketing/campaigns/:id
 * @access  Private
 */
const deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // First, check if the campaign exists and belongs to the user
  const { data: existingCampaign, error: fetchError } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', req.user.id)
    .single();
  
  if (fetchError) {
    console.error('Error fetching campaign to delete:', fetchError);
    res.status(404);
    throw new Error('Marketing campaign not found or you do not have permission to delete it');
  }
  
  // Delete the campaign (cascade will handle related google_ads_content records)
  const { error } = await supabase
    .from('marketing_campaigns')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting campaign:', error);
    res.status(400);
    throw new Error('Could not delete marketing campaign');
  }
  
  res.status(200).json({
    success: true,
    message: 'Marketing campaign deleted successfully'
  });
});

/**
 * @desc    Generate responsive search ad content
 * @route   POST /api/marketing/generate/google-ads/responsive-search
 * @access  Private
 */
const generateResponsiveSearchAd = asyncHandler(async (req, res) => {
  const { campaign_id, options } = req.body;
  
  if (!campaign_id) {
    res.status(400);
    throw new Error('Campaign ID is required');
  }
  
  // TODO: Implement actual generation logic
  // This will be implemented in the next step when we integrate with OpenAI
  
  res.status(200).json({
    success: true,
    message: 'Responsive search ad generation endpoint (to be implemented)'
  });
});

/**
 * @desc    Generate performance max ad content
 * @route   POST /api/marketing/generate/google-ads/performance-max
 * @access  Private
 */
const generatePerformanceMaxAd = asyncHandler(async (req, res) => {
  const { campaign_id, options } = req.body;
  
  if (!campaign_id) {
    res.status(400);
    throw new Error('Campaign ID is required');
  }
  
  // TODO: Implement actual generation logic
  // This will be implemented in the next step when we integrate with OpenAI
  
  res.status(200).json({
    success: true,
    message: 'Performance max ad generation endpoint (to be implemented)'
  });
});

/**
 * @desc    Generate ad extensions
 * @route   POST /api/marketing/generate/google-ads/extensions
 * @access  Private
 */
const generateAdExtensions = asyncHandler(async (req, res) => {
  const { campaign_id, options } = req.body;
  
  if (!campaign_id) {
    res.status(400);
    throw new Error('Campaign ID is required');
  }
  
  // TODO: Implement actual generation logic
  // This will be implemented in the next step when we integrate with OpenAI
  
  res.status(200).json({
    success: true,
    message: 'Ad extensions generation endpoint (to be implemented)'
  });
});

/**
 * @desc    Get all Google Ads content for a campaign
 * @route   GET /api/marketing/google-ads-content/:campaignId
 * @access  Private
 */
const getGoogleAdsContent = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;
  
  // First, verify the campaign belongs to the user
  const { data: campaign, error: campaignError } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('user_id', req.user.id)
    .single();
  
  if (campaignError) {
    console.error('Error fetching campaign:', campaignError);
    res.status(404);
    throw new Error('Campaign not found or you do not have permission to access it');
  }
  
  // Get all Google Ads content for the campaign
  const { data, error } = await supabase
    .from('google_ads_content')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching Google Ads content:', error);
    res.status(400);
    throw new Error('Could not retrieve Google Ads content');
  }
  
  res.status(200).json({
    success: true,
    count: data.length,
    data
  });
});

/**
 * @desc    Update Google Ads content
 * @route   PUT /api/marketing/google-ads-content/:id
 * @access  Private
 */
const updateGoogleAdsContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content_data } = req.body;
  
  if (!content_data) {
    res.status(400);
    throw new Error('Content data is required');
  }
  
  // Verify ownership through the campaign relationship
  const { data: content, error: contentFetchError } = await supabase
    .from('google_ads_content')
    .select('*, marketing_campaigns!inner(user_id)')
    .eq('id', id)
    .eq('marketing_campaigns.user_id', req.user.id)
    .single();
  
  if (contentFetchError) {
    console.error('Error verifying ownership:', contentFetchError);
    res.status(404);
    throw new Error('Content not found or you do not have permission to update it');
  }
  
  // Update the content
  const { data, error } = await supabase
    .from('google_ads_content')
    .update({ content_data })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating Google Ads content:', error);
    res.status(400);
    throw new Error('Could not update Google Ads content');
  }
  
  res.status(200).json({
    success: true,
    data: data[0]
  });
});

/**
 * @desc    Delete Google Ads content
 * @route   DELETE /api/marketing/google-ads-content/:id
 * @access  Private
 */
const deleteGoogleAdsContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Verify ownership through the campaign relationship
  const { data: content, error: contentFetchError } = await supabase
    .from('google_ads_content')
    .select('*, marketing_campaigns!inner(user_id)')
    .eq('id', id)
    .eq('marketing_campaigns.user_id', req.user.id)
    .single();
  
  if (contentFetchError) {
    console.error('Error verifying ownership:', contentFetchError);
    res.status(404);
    throw new Error('Content not found or you do not have permission to delete it');
  }
  
  // Delete the content
  const { error } = await supabase
    .from('google_ads_content')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting Google Ads content:', error);
    res.status(400);
    throw new Error('Could not delete Google Ads content');
  }
  
  res.status(200).json({
    success: true,
    message: 'Google Ads content deleted successfully'
  });
});

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  generateResponsiveSearchAd,
  generatePerformanceMaxAd,
  generateAdExtensions,
  getGoogleAdsContent,
  updateGoogleAdsContent,
  deleteGoogleAdsContent
}; 