// models/user.model.js
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();
// Initialize Supabase client (ensure these env variables are set)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// User model wrapper for Supabase based on your actual schema
const User = {
  // Find a user by ID
  findById: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')  // You're using 'profiles' table
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  // Get user usage statistics - matches your data structure
  getUsageStats: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('usage, subscription')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    return {
      totalGenerated: data?.usage?.contentGenerated || 0,
      apiCalls: data?.usage?.apiCalls || 0,
      lastUsed: data?.usage?.lastUsed,
      subscription: data?.subscription || {
        plan: 'free',
        status: 'active'
      }
    };
  },
  
  // Update usage statistics
  updateUsage: async (userId, usageUpdate) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        usage: usageUpdate
      })
      .eq('id', userId)
      .select();
      
    if (error) throw error;
    return data;
  }
};

module.exports = User;