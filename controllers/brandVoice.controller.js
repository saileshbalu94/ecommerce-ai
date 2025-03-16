const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create a new brand voice
exports.createBrandVoice = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    // Add user ID to the brand voice data
    const brandVoiceData = {
      ...req.body,
      user_id: userId
    };
    
    const { data, error } = await supabase
      .from('brand_voices')
      .insert([brandVoiceData]);

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all brand voices
exports.getBrandVoices = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a brand voice
exports.updateBrandVoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // First check if the brand voice belongs to the user
    const { data: existingData, error: fetchError } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    
    if (!existingData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Brand voice not found or you do not have permission to update it' 
      });
    }

    // Update the brand voice
    const { data, error } = await supabase
      .from('brand_voices')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a brand voice
exports.deleteBrandVoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // First check if the brand voice belongs to the user
    const { data: existingData, error: fetchError } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    
    if (!existingData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Brand voice not found or you do not have permission to delete it' 
      });
    }

    // Delete the brand voice
    const { error } = await supabase
      .from('brand_voices')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Brand voice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a brand voice by ID
exports.getBrandVoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Brand voice not found'
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 