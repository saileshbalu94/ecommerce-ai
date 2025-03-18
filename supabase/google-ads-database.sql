-- Create marketing_campaigns table for all marketing campaign types
CREATE TABLE public.marketing_campaigns (
  -- Core Campaign Fields
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  product_name TEXT,
  description TEXT NOT NULL,
  industry TEXT,
  campaign_objective TEXT NOT NULL,
  target_audience TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  
  -- Key Marketing Elements
  unique_selling_points TEXT[] DEFAULT '{}',
  key_benefits TEXT[] DEFAULT '{}',
  key_features TEXT[] DEFAULT '{}',
  value_proposition TEXT,
  special_offers TEXT,
  price_point TEXT,
  
  -- Keyword Strategy
  primary_keywords TEXT[] DEFAULT '{}',
  secondary_keywords TEXT[] DEFAULT '{}',
  brand_terms TEXT[] DEFAULT '{}',
  competitor_terms TEXT[] DEFAULT '{}',
  negative_keywords TEXT[] DEFAULT '{}',
  
  -- Call-to-Action & Tones
  cta TEXT,
  
  -- URL Information
  landing_page_url TEXT NOT NULL,
  display_path TEXT,
  tracking_parameters TEXT,
  
  -- Additional Fields
  channel_type TEXT NOT NULL,
  brand_voice_id UUID,
  use_brand_voice BOOLEAN DEFAULT true,
  tone_override TEXT
);

-- Create index for faster querying by user and channel type
CREATE INDEX idx_marketing_campaigns_user_id ON public.marketing_campaigns(user_id);
CREATE INDEX idx_marketing_campaigns_channel_type ON public.marketing_campaigns(channel_type);

-- Create comment to document the marketing_campaigns table
COMMENT ON TABLE public.marketing_campaigns IS 'Stores marketing campaign data for different channels (Google Ads, Meta Ads, etc.)';

-- Create google_ads_content table for storing generated Google Ads content
CREATE TABLE public.google_ads_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE NOT NULL,
  google_ads_type TEXT NOT NULL CHECK (google_ads_type IN ('responsive_search', 'performance_max', 'ad_extensions')),
  content_data JSONB NOT NULL,
  generation_params JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster querying
CREATE INDEX idx_google_ads_content_campaign_id ON public.google_ads_content(campaign_id);
CREATE INDEX idx_google_ads_content_type ON public.google_ads_content(google_ads_type);

-- Create comment to document the google_ads_content table
COMMENT ON TABLE public.google_ads_content IS 'Stores generated Google Ads content for different ad types';

-- Add RLS (Row Level Security) policies
-- Marketing campaigns RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own marketing campaigns"
  ON public.marketing_campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own marketing campaigns"
  ON public.marketing_campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketing campaigns"
  ON public.marketing_campaigns
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketing campaigns"
  ON public.marketing_campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

-- Google Ads Content RLS
ALTER TABLE public.google_ads_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own Google Ads content"
  ON public.google_ads_content
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.marketing_campaigns 
      WHERE id = public.google_ads_content.campaign_id
    )
  );

CREATE POLICY "Users can insert Google Ads content for their campaigns"
  ON public.google_ads_content
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.marketing_campaigns 
      WHERE id = public.google_ads_content.campaign_id
    )
  );

CREATE POLICY "Users can update Google Ads content for their campaigns"
  ON public.google_ads_content
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.marketing_campaigns 
      WHERE id = public.google_ads_content.campaign_id
    )
  );

CREATE POLICY "Users can delete Google Ads content for their campaigns"
  ON public.google_ads_content
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.marketing_campaigns 
      WHERE id = public.google_ads_content.campaign_id
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_marketing_campaigns_updated_at
BEFORE UPDATE ON public.marketing_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_ads_content_updated_at
BEFORE UPDATE ON public.google_ads_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add function to update content table to include Google Ads content types
-- Simplified approach without the conditional check that was causing the error
CREATE OR REPLACE FUNCTION add_google_ads_to_content_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.content (
    user_id,
    title,
    content_type,
    original_input,
    generation_parameters,
    generated_content,
    metadata
  )
  SELECT 
    mc.user_id,
    CASE 
      WHEN NEW.google_ads_type = 'responsive_search' THEN concat(mc.name, ' - Responsive Search Ad')
      WHEN NEW.google_ads_type = 'performance_max' THEN concat(mc.name, ' - Performance Max')
      WHEN NEW.google_ads_type = 'ad_extensions' THEN concat(mc.name, ' - Ad Extensions')
      ELSE concat(mc.name, ' - Google Ads')
    END,
    CASE 
      WHEN NEW.google_ads_type = 'responsive_search' THEN 'google-ads-responsive-search'
      WHEN NEW.google_ads_type = 'performance_max' THEN 'google-ads-performance-max'
      WHEN NEW.google_ads_type = 'ad_extensions' THEN 'google-ads-extensions'
      ELSE 'google-ads'
    END,
    jsonb_build_object(
      'campaignId', mc.id,
      'campaignName', mc.name,
      'productName', mc.product_name,
      'description', mc.description,
      'targetAudience', mc.target_audience,
      'uniqueSellingPoints', mc.unique_selling_points,
      'keyBenefits', mc.key_benefits,
      'keyFeatures', mc.key_features,
      'primaryKeywords', mc.primary_keywords
    ),
    NEW.generation_params,
    NEW.content_data,
    jsonb_build_object(
      'sourceTable', 'google_ads_content',
      'sourceId', NEW.id,
      'googleAdsType', NEW.google_ads_type,
      'channelType', mc.channel_type
    )
  FROM public.marketing_campaigns mc
  WHERE mc.id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add Google Ads content to content history
CREATE TRIGGER google_ads_content_to_history
AFTER INSERT ON public.google_ads_content
FOR EACH ROW
EXECUTE FUNCTION add_google_ads_to_content_history(); 