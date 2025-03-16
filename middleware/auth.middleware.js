// middleware/auth.middleware.js - Authentication middleware
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for verification
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Protect routes - verify user authentication with Supabase
 * @middleware
 */
exports.protect = async (req, res, next) => {
  try {
    console.log('Authenticating request...');
    let token;
    
    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      console.log('Authentication failed: No token provided');
      return res.status(401).json({
        success: false,
        message: 'You are not logged in. Please login to access this resource.'
      });
    }
    
    try {
      // Verify token with Supabase by getting user
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.log('Token verification failed:', error?.message || 'User not found');
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
      
      console.log(`Token verified for user ID: ${user.id}`);
      
      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.log('Profile fetch failed:', profileError.message);
        // Continue anyway, maybe a new user without profile yet
      }
      
      // Add user info to request object
      req.user = {
        id: user.id,
        email: user.email,
        role: profile?.role || 'user',
        subscription: profile?.subscription || {
          plan: 'free',
          status: 'trial'
        }
      };
      
      next();
    } catch (error) {
      console.log('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('❌ Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Restrict to specific roles
 * @middleware
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(`Checking role access: User role = ${req.user.role}, Required roles = ${roles}`);
    
    // Check if user role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      console.log('Access denied: Insufficient permissions');
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    
    next();
  };
};

/**
 * Check subscription status
 * @middleware
 */
exports.checkSubscription = async (req, res, next) => {
  try {
    console.log('Checking subscription status...');
    
    const subscription = req.user.subscription;
    
    if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trial')) {
      console.log('Access denied: Invalid subscription');
      return res.status(403).json({
        success: false,
        message: 'Your subscription is inactive or expired. Please update your subscription to continue.'
      });
    }
    
    // Check if subscription is expired
    if (subscription.endDate && new Date(subscription.endDate) < new Date()) {
      console.log('Access denied: Expired subscription');
      return res.status(403).json({
        success: false,
        message: 'Your subscription has expired. Please renew to continue.'
      });
    }
    
    console.log(`Subscription active for user: ${req.user.email}`);
    next();
  } catch (error) {
    console.error('❌ Subscription check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription status',
      error: error.message
    });
  }
};

exports.authenticateUser = async (req, res, next) => {
  try {
    // Get the token from the request headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication token is required' });
    }
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Add the user to the request object
    req.user = user;
    
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};