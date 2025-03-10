# Supabase Setup Guide for eCommerce AI Content Generator

This guide provides detailed steps to set up Supabase for authentication and database functionality for our application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://app.supabase.com/) and sign up or log in
2. Click "New Project" 
3. Enter a project name (e.g., "ecommerce-ai-generator")
4. Set a secure database password (save this somewhere safe)
5. Choose the region closest to your users
6. Click "Create New Project"
7. Wait for your project to be set up (usually takes 2-3 minutes)

## 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Email Auth**, ensure it's enabled (it is by default)
3. Customize the email templates if desired
4. Under **URL Configuration**:
   - Set Site URL to your frontend URL (e.g., `http://localhost:3000` for local development)
   - Add Redirect URLs for password reset and email confirmation:
     - `http://localhost:3000/reset-password`
     - `http://localhost:3000/auth/callback`

## 3. Set Up Database Tables

1. Go to the **SQL Editor** in your Supabase dashboard
2. Create a new query and paste the following SQL code from our `schema.sql` file:

```sql
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

-- Service roles can view all profiles
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
```

3. Run the SQL query to create all tables, functions, and policies

## 4. Get API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll need to copy these values for your application:
   - **Project URL**: This is your Supabase URL (e.g., `https://abcdefghijklm.supabase.co`)
   - **Project API Keys**:
     - **anon** (public): Used for client-side code
     - **service_role** (secret): Only used on the server side

## 5. Set Up Environment Variables

### Frontend (.env in client directory)

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Backend (.env in root directory)

```
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-key
OPENAI_API_KEY=your-openai-api-key
```

## 6. Install Supabase Client Libraries

### Frontend

```bash
cd client
npm install @supabase/supabase-js
```

### Backend

```bash
npm install @supabase/supabase-js
```

## 7. Test Authentication Flow

1. Start your frontend and backend servers
2. Try registering a new user
3. Check your Supabase dashboard under **Authentication** → **Users** to verify user creation
4. Check the **Table Editor** to see if a profile was created in the `profiles` table

## 8. Advanced Features (Optional)

### Enable Social Login

1. Go to **Authentication** → **Providers**
2. Enable and configure providers you want (Google, GitHub, etc.)
3. Follow provider-specific instructions to obtain client IDs and secrets

### Set Up Storage

1. Go to **Storage**
2. Create a new bucket (e.g., "content-images")
3. Configure bucket permissions
4. Use Supabase Storage in your app for file uploads

### Enable Realtime Subscriptions

1. Go to **Database** → **Replication**
2. Enable realtime for the tables you want to subscribe to changes on
3. Use Supabase's realtime client to subscribe to changes

## 9. Production Considerations

1. Set proper CORS and security settings
2. Use proper domains for your site URL and redirect URLs
3. Consider implementing rate limiting
4. Set up custom email templates
5. Configure proper password policies

## Troubleshooting

- **Authentication issues**: Check browser console for CORS errors
- **Database access problems**: Verify row-level security policies
- **JWT issues**: Check token expiration and refresh token flow
- **Profile creation issues**: Check trigger function and permissions

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers for React](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)