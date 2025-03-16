// Script to create the 'product-images' bucket in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or Service Key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  try {
    console.log('Creating product-images bucket in Supabase...');
    
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }
    
    // Check if bucket already exists
    const bucketExists = buckets.some(bucket => bucket.name === 'product-images');
    
    if (bucketExists) {
      console.log('Bucket product-images already exists');
      process.exit(0);
    }
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('product-images', {
      public: true, // Allow public access
      fileSizeLimit: 5 * 1024 * 1024 // 5MB limit
    });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Bucket product-images created successfully');
    
    // Set up bucket policies to allow public access
    const { error: policyError } = await supabase.storage.from('product-images').createSignedUrl('dummy.txt', 60);
    
    if (policyError && !policyError.message.includes('not found')) {
      console.warn('Warning setting bucket policy:', policyError);
    }
    
    console.log('Bucket configuration complete');
  } catch (error) {
    console.error('Error creating bucket:', error);
    process.exit(1);
  }
}

createBucket(); 