# Google Ads Implementation Checklist

## 1. Database Schema Extensions

### Marketing Campaigns Table
- [ ] Create `marketing_campaigns` table with the following field groups:
  
  **Core Campaign Fields:**
  - [ ] `id` (UUID)
  - [ ] `user_id` (UUID)
  - [ ] `name` (String)
  - [ ] `product_name` (String)
  - [ ] `description` (Text)
  - [ ] `industry` (String)
  - [ ] `campaign_objective` (String)
  - [ ] `target_audience` (Text)
  - [ ] `created_at` (Timestamp)
  - [ ] `updated_at` (Timestamp)
  - [ ] `is_active` (Boolean)
  
  **Key Marketing Elements:**
  - [ ] `unique_selling_points` (Array<String>)
  - [ ] `key_benefits` (Array<String>)
  - [ ] `key_features` (Array<String>)
  - [ ] `value_proposition` (Text)
  - [ ] `special_offers` (String)
  - [ ] `price_point` (String)
  
  **Keyword Strategy:**
  - [ ] `primary_keywords` (Array<String>)
  - [ ] `secondary_keywords` (Array<String>)
  - [ ] `brand_terms` (Array<String>)
  - [ ] `competitor_terms` (Array<String>)
  - [ ] `negative_keywords` (Array<String>)
  
  **Call-to-Action & Tones:**
  - [ ] `cta` (String)
  
  **URL Information:**
  - [ ] `landing_page_url` (String)
  - [ ] `display_path` (String)
  - [ ] `tracking_parameters` (String)
  
  **Additional Fields:**
  - [ ] `channel_type` (String, e.g., "google_ads", "meta_ads", etc.)
  - [ ] `brand_voice_id` (UUID, reference to brand_voices table)
  - [ ] `use_brand_voice` (Boolean)
  - [ ] `tone_override` (String, used when not using brand voice)

### Google Ads Content Table
- [ ] Create `google_ads_content` table with:
  - [ ] `id` (UUID)
  - [ ] `campaign_id` (UUID, reference to marketing_campaigns)
  - [ ] `google_ads_type` (String: "responsive_search", "performance_max", "ad_extensions")
  - [ ] `content_data` (JSONB for different ad formats)
  - [ ] `generation_params` (JSONB for settings used)
  - [ ] `created_at` (Timestamp)
  - [ ] `updated_at` (Timestamp)

### Content History Integration
- [ ] Add Google Ads record types to content history
- [ ] Create relations between content history and google_ads_content

## 2. Backend API Development

### Campaign Management Endpoints
- [ ] Create CRUD operations for campaigns (`/api/marketing/campaigns`)
- [ ] Implement campaign listing with filters (`/api/marketing/campaigns?channel=google_ads`)
- [ ] Add validation for required fields

### Google Ads Generation Endpoints
- [ ] Create content generation endpoint (`/api/generate/google_ads`)
- [ ] Add endpoints for different asset types:
  - [ ] `/api/generate/google_ads/responsive_search`
  - [ ] `/api/generate/google_ads/performance_max`
  - [ ] `/api/generate/google_ads/extensions`
- [ ] Implement character limit validation middleware

### Content History API Updates
- [ ] Update APIs to include Google Ads content types
- [ ] Add Google Ads-specific metadata in responses

### AI Integration
- [ ] Create specialized Google Ads prompts with character constraints
- [ ] Implement branching logic based on ad type
- [ ] Integrate brand voice parameters vs. tone override options

## 3. Frontend Components

### Navigation Updates
- [ ] Add "Marketing Content" section to sidebar
- [ ] Add "Google Ads" sub-item with icon

### Campaign Management UI
- [ ] Create `GoogleAdsCampaignList.jsx` component
- [ ] Create `GoogleAdsCampaignForm.jsx` component with all specified fields
- [ ] Implement field grouping as per excel categories
- [ ] Add brand voice selector with toggle (similar to product description)

### Google Ads Creation Screen
- [ ] Create `GoogleAdsGenerator.jsx` as main container
- [ ] Create tab components:
  - [ ] `GoogleAdsCampaignSetup.jsx`
  - [ ] `GoogleAdsGeneratedContent.jsx`
- [ ] Create asset type selection component with checkbox options
- [ ] Create field components for each ad format with character counters

### Generated Content View
- [ ] Create components for each ad type:
  - [ ] `ResponsiveSearchAdResults.jsx`
  - [ ] `PerformanceMaxResults.jsx`
  - [ ] `AdExtensionsResults.jsx`
- [ ] Add copy/edit/regenerate functionality
- [ ] Add export options component

### Brand Voice Integration
- [ ] Add brand voice selector (reuse from product descriptions)
- [ ] Add toggle between "Use Brand Voice" and "Use Custom Tone"
- [ ] Create tone selector dropdown for custom tone option

## 4. Integration Work

### State Management
- [ ] Create React Query hooks for campaigns:
  - [ ] `useGoogleAdsCampaigns.js`
  - [ ] `useGoogleAdsCampaign.js`
  - [ ] `useCreateGoogleAdsCampaign.js`
- [ ] Create generation hooks:
  - [ ] `useGenerateGoogleAds.js`

### Content History Integration
- [ ] Update content filtering to include Google Ads types
- [ ] Create dedicated Google Ads content viewer

### Export Functionality
- [ ] Create exporters for Google Ads formats
- [ ] Implement clipboard operations

## 5. Testing & QA

### Unit Tests
- [ ] Test campaign validation 
- [ ] Test Google Ads character limits
- [ ] Test ad format conversions

### Integration Tests
- [ ] Test brand voice application to Google Ads
- [ ] Test campaign persistence and retrieval
- [ ] Test generation with various inputs

### UI/UX Testing
- [ ] Test form validation with campaign fields
- [ ] Test responsive design of ad content displays
- [ ] Validate character counters and limits

## 6. Deployment & Documentation

- [ ] Create database migrations for new tables and fields
- [ ] Update API documentation with Google Ads endpoints
- [ ] Create user guides for Google Ads campaign creation
- [ ] Document export formats and usage instructions 