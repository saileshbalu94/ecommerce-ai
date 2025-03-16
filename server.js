// Load environment variables first
require('dotenv').config();

// server.js - Main entry point for our Express server
const express = require('express');
const cors = require('cors');

const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');

// Route imports
const contentRoutes = require('./routes/content.routes');
const userRoutes = require('./routes/user.routes');
const brandVoiceRoutes = require('./routes/brandVoice.routes');



// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize express application
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(morgan('dev')); // Log HTTP requests

// API Routes
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api', brandVoiceRoutes);

// Root route for API health check
app.get('/', (req, res) => {
  res.send({ 
    status: 'online',
    message: 'eCommerce AI Content Generator API is running' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).send({ 
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message 
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📅 Server started at: ${new Date().toISOString()}`);
});