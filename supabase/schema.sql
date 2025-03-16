-- Schema for the eCommerce AI Content Generator

-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE - Stores user profile information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  subscription JSONB DEFAULT jsonb_build_object(
    'plan', 'free',
    'status', 'trial',
    'startDate', current_timestamp,
    'endDate', (current_timestamp + interval '30 days')
  ),
  brand_voice JSONB DEFAULT jsonb_build_object(
    'tone', 'professional',
    'style', 'balanced',
    'examples', jsonb_build_array(),
    'keywords', jsonb_build_array(),
    'avoidWords', jsonb_build_array()
  ),
  usage JSONB DEFAULT jsonb_build_object(
    'contentGenerated', 0,
    'apiCalls', 0,
    'lastUsed', current_timestamp
  ),
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profile for each new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CONTENT TABLE - Stores generated content
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  original_input JSONB,
  generation_parameters JSONB,
  generated_content JSONB NOT NULL,
  metadata JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add text search capability to content
ALTER TABLE public.content ADD COLUMN content_search TSVECTOR 
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') || 
    setweight(to_tsvector('english', coalesce(content_type, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(generated_content->>'text', '')), 'C')
  ) STORED;

CREATE INDEX content_search_idx ON public.content USING GIN (content_search);

-- Functions for incrementing JSONB number fields (needed for usage stats)
CREATE OR REPLACE FUNCTION public.increment(obj JSONB, field TEXT, increment INT DEFAULT 1)
RETURNS JSONB AS $$
DECLARE
  value INT;
BEGIN
  value := COALESCE((obj->>field)::INT, 0) + increment;
  RETURN jsonb_set(obj, ARRAY[field], to_jsonb(value));
END;
$$ LANGUAGE plpgsql;

-- BRAND_VOICES TABLE - Stores brand voice profiles
CREATE TABLE public.brand_voices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_default BOOLEAN DEFAULT false,
  brand_identity JSONB,
  tone JSONB,
  style JSONB,
  language JSONB,
  content_structure JSONB,
  vocabulary JSONB,
  examples JSONB,
  visual_elements JSONB,
  seo_preferences JSONB
);

-- Row level security policies

-- PROFILES table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Service roles (and admins when using service role) can view all profiles
CREATE POLICY "Service roles can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.role() = 'service_role');

-- Service roles can update all profiles
CREATE POLICY "Service roles can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.role() = 'service_role');

-- Service roles can delete profiles
CREATE POLICY "Service roles can delete profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (auth.role() = 'service_role');

-- CONTENT table policies
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Users can view their own content
CREATE POLICY "Users can view own content" 
  ON public.content 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own content
CREATE POLICY "Users can create own content" 
  ON public.content 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own content
CREATE POLICY "Users can update own content" 
  ON public.content 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own content
CREATE POLICY "Users can delete own content" 
  ON public.content 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Service roles can view all content
CREATE POLICY "Service roles can view all content" 
  ON public.content 
  FOR SELECT 
  USING (auth.role() = 'service_role');

-- Service roles can delete all content
CREATE POLICY "Service roles can delete all content" 
  ON public.content 
  FOR DELETE 
  USING (auth.role() = 'service_role');

-- BRAND_VOICES table policies
ALTER TABLE public.brand_voices ENABLE ROW LEVEL SECURITY;

-- Users can view their own brand voices
CREATE POLICY "Users can view own brand voices" 
  ON public.brand_voices 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own brand voices
CREATE POLICY "Users can create own brand voices" 
  ON public.brand_voices 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own brand voices
CREATE POLICY "Users can update own brand voices" 
  ON public.brand_voices 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own brand voices
CREATE POLICY "Users can delete own brand voices" 
  ON public.brand_voices 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Service roles can view all brand voices
CREATE POLICY "Service roles can view all brand voices" 
  ON public.brand_voices 
  FOR SELECT 
  USING (auth.role() = 'service_role');

-- Service roles can update all brand voices
CREATE POLICY "Service roles can update all brand voices" 
  ON public.brand_voices 
  FOR UPDATE 
  USING (auth.role() = 'service_role');

-- Service roles can delete all brand voices
CREATE POLICY "Service roles can delete all brand voices" 
  ON public.brand_voices 
  FOR DELETE 
  USING (auth.role() = 'service_role');