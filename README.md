# eCommerce AI Content Generator

An AI-powered platform for eCommerce businesses to generate product descriptions, titles, and other marketing content using OpenAI's GPT models.

## Project Overview

This application provides eCommerce entrepreneurs with a powerful tool to create high-quality product content quickly and efficiently. By leveraging AI, users can generate professional product descriptions and titles that align with their brand voice and drive conversions.

## Features

- AI-powered generation of product descriptions and titles
- Brand voice customization
- Content history and version tracking
- User authentication with Supabase
- Dashboard with usage statistics

## Tech Stack

### Backend
- Node.js with Express.js
- Supabase for authentication and database
- OpenAI API integration

### Frontend
- React.js
- React Router for navigation
- React Query for data fetching
- Chakra UI for styling
- Axios for API requests
- Supabase Auth for authentication

## Getting Started

### Prerequisites

- Node.js (v14.x or higher)
- Supabase account (free tier available)
- OpenAI API key

### Supabase Setup

1. Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)

2. After your project is created, go to the SQL Editor and create a `profiles` table:

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  subscription JSONB,
  brand_voice JSONB,
  usage JSONB,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create policy to allow users to read only their own profile
CREATE POLICY "Users can read own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create policy to allow users to update only their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create policy to enable row level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a table for storing generated content
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

-- Create policy to allow users to read only their own content
CREATE POLICY "Users can read own content" 
  ON public.content 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert own content
CREATE POLICY "Users can insert own content" 
  ON public.content 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update only their own content
CREATE POLICY "Users can update own content" 
  ON public.content 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete only their own content
CREATE POLICY "Users can delete own content" 
  ON public.content 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable row level security
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
```

3. Set up authentication in your Supabase project:
   - Go to Authentication > Settings
   - Make sure Email Auth is enabled
   - Configure Site URL to match your frontend URL (e.g., http://localhost:3000)
   - Configure redirect URLs (e.g., http://localhost:3000/reset-password)

4. Get your Supabase URL and anon key from Settings > API

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd ecommerce-ai-generator
   ```

2. Install dependencies for both backend and frontend
   ```
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Create a `.env` file in the client directory with:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Running the Application

1. Start the backend server
   ```
   npm run dev
   ```

2. In a new terminal, start the frontend
   ```
   cd client
   npm start
   ```

3. Access the application at http://localhost:3000

## Development Roadmap

### Phase 1 (Current)
- Basic user authentication with Supabase
- Product description and title generation
- Brand voice settings
- Content history

### Phase 2 (Planned)
- Email marketing templates
- Social media posts
- Meta and Google ads copies
- SEO content
- Content calendar and scheduling
- Advanced integrations with eCommerce platforms

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenAI for their powerful GPT models
- Supabase for the auth and database infrastructure
- The creators of all the open-source libraries used in this project