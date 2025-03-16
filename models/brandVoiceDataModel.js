// models/brandVoiceDataModel.js

// This file defines the brand voice data model for Supabase.
// All fields are optional to allow flexibility for users.

const brandVoiceDataModel = {
  id: 'uuid', // Unique identifier
  name: 'text', // Name of this brand voice profile
  created_at: 'timestamp', // Creation timestamp
  updated_at: 'timestamp', // Last update timestamp
  is_default: 'boolean', // Whether this is the user's default brand voice
  
  // Brand Identity
  brand_identity: 'jsonb',

  // Tone & Style
  tone: 'jsonb',
  style: 'jsonb',

  // Language Preferences
  language: 'jsonb',

  // Content Structure
  content_structure: 'jsonb',

  // Vocabulary
  vocabulary: 'jsonb',

  // Examples
  examples: 'jsonb',

  // Visual Elements
  visual_elements: 'jsonb',

  // SEO Preferences
  seo_preferences: 'jsonb'
};

module.exports = brandVoiceDataModel; 