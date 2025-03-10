# Supabase Schema Reference

This document serves as a reference for our Supabase database schema, replacing the Mongoose models previously used.

## Profile Schema

Replaces the former `user.model.js` Mongoose model.

```sql
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
```

### Profile Fields:

- **id**: UUID from auth.users table (primary key)
- **name**: User's full name
- **subscription**: JSON object with subscription details
  - **plan**: Subscription tier ('free', 'starter', 'growth', 'scale')
  - **status**: Subscription status ('trial', 'active', 'inactive')
  - **startDate**: When subscription started
  - **endDate**: When subscription expires
- **brand_voice**: JSON object with brand voice settings
  - **tone**: Voice tone ('professional', 'friendly', etc.)
  - **style**: Writing style ('balanced', 'benefit-focused', etc.)
  - **examples**: Array of example text snippets
  - **keywords**: Array of brand keywords to include
  - **avoidWords**: Array of words to avoid
- **usage**: JSON object with usage statistics
  - **contentGenerated**: Counter for generated content
  - **apiCalls**: Counter for API calls
  - **lastUsed**: Timestamp of last platform use
- **role**: User role ('user', 'admin')
- **created_at**: Timestamp of profile creation
- **updated_at**: Timestamp of last profile update

## Content Schema

Replaces the former `content.model.js` Mongoose model.

```sql
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
```

### Content Fields:

- **id**: UUID for content item (primary key)
- **user_id**: UUID of user who owns the content (foreign key)
- **title**: Content title
- **content_type**: Type of content ('product-description', 'product-title', etc.)
- **original_input**: JSON object with original input parameters
  - **productName**: Product name
  - **productCategory**: Product category
  - **productFeatures**: Array of product features
  - **targetAudience**: Target audience description
  - **keywords**: Array of keywords
  - **additionalInfo**: Additional context
- **generation_parameters**: JSON object with generation settings
  - **tone**: Voice tone used
  - **style**: Writing style used 
  - **length**: Content length setting
  - **format**: Content format
- **generated_content**: JSON object with generated content
  - **text**: The actual generated content
  - **versions**: Array of content versions
    - **text**: Version text
    - **createdAt**: Version creation timestamp
    - **feedback**: Object with rating and comments
- **metadata**: JSON object with generation metadata
  - **modelUsed**: AI model used
  - **tokensUsed**: Number of tokens consumed
  - **generationTime**: Time taken to generate
  - **cost**: Estimated cost
- **status**: Content status ('draft', 'published', 'archived')
- **created_at**: Timestamp of content creation
- **updated_at**: Timestamp of last content update

## Key Differences from Mongoose

1. **Authentication**: User authentication is handled by Supabase Auth, not our models
2. **Schema Validation**: Enforced at application level, not database level
3. **Relationships**: Defined through foreign keys instead of Mongoose references
4. **Methods**: Business logic moved to controllers instead of model methods
5. **Middleware**: No pre/post hooks; using database triggers instead

For full database setup instructions, refer to [SUPABASE_SETUP.md](../SUPABASE_SETUP.md).