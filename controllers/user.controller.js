// controllers/user.controller.js - User controller
const User = require('../models/user.model');


/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    console.log('Getting user profile...');
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('Get profile failed: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`✅ Profile retrieved for user: ${user.email}`);
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('❌ Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    console.log('Updating user profile...');
    
    const { name, email } = req.body;
    
    // Check if email already exists if trying to change it
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        console.log('Update profile failed: Email already exists');
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name || undefined,
        email: email || undefined
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedUser) {
      console.log('Update profile failed: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`✅ Profile updated for user: ${updatedUser.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('❌ Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
};

/**
 * Update brand voice settings
 * @route PUT /api/users/brand-voice
 * @access Private
 */
exports.updateBrandVoice = async (req, res) => {
  try {
    console.log('Updating brand voice settings...');
    
    const { tone, style, examples, keywords, avoidWords } = req.body;
    
    // Create update object with only provided fields
    const updateData = {};
    if (tone) updateData['brandVoice.tone'] = tone;
    if (style) updateData['brandVoice.style'] = style;
    if (examples) updateData['brandVoice.examples'] = examples;
    if (keywords) updateData['brandVoice.keywords'] = keywords;
    if (avoidWords) updateData['brandVoice.avoidWords'] = avoidWords;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedUser) {
      console.log('Update brand voice failed: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`✅ Brand voice updated for user: ${updatedUser.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Brand voice settings updated successfully',
      data: {
        brandVoice: updatedUser.brandVoice
      }
    });
  } catch (error) {
    console.error('❌ Update brand voice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update brand voice settings',
      error: error.message
    });
  }
};

/**
 * Get user usage statistics
 * @route GET /api/users/usage
 * @access Private
 */
exports.getUserUsage = async (req, res) => {
  try {
    console.log('Getting user usage statistics...');
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('Get usage failed: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get content count by type
    const contentTypeStats = await Content.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: '$contentType', count: { $sum: 1 } } }
    ]);
    
    // Format content type stats
    const contentStats = {};
    contentTypeStats.forEach(stat => {
      contentStats[stat._id] = stat.count;
    });
    
    // Get content creation over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyContentCreation = await Content.aggregate([
      { 
        $match: { 
          user: user._id,
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    console.log(`✅ Usage statistics retrieved for user: ${user.email}`);
    
    res.status(200).json({
      success: true,
      data: {
        usage: user.usage,
        contentStats,
        dailyContentCreation,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('❌ Get user usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve usage statistics',
      error: error.message
    });
  }
};

/**
 * Update subscription
 * @route PUT /api/users/subscription
 * @access Private
 */
exports.updateSubscription = async (req, res) => {
  try {
    console.log('Updating user subscription...');
    
    const { plan, status, startDate, endDate } = req.body;
    
    // Create update object with only provided fields
    const updateData = {};
    if (plan) updateData['subscription.plan'] = plan;
    if (status) updateData['subscription.status'] = status;
    if (startDate) updateData['subscription.startDate'] = startDate;
    if (endDate) updateData['subscription.endDate'] = endDate;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedUser) {
      console.log('Update subscription failed: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`✅ Subscription updated for user: ${updatedUser.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        subscription: updatedUser.subscription
      }
    });
  } catch (error) {
    console.error('❌ Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
};

/**
 * Get all users (admin only)
 * @route GET /api/users
 * @access Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Getting all users (admin)...');
    
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users with pagination
    const users = await User.find()
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await User.countDocuments();
    
    console.log(`✅ Retrieved ${users.length} users`);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        pageSize: parseInt(limit)
      },
      data: {
        users
      }
    });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

/**
 * Get user by ID (admin only)
 * @route GET /api/users/:id
 * @access Private/Admin
 */
exports.getUserById = async (req, res) => {
  try {
    console.log(`Getting user ID: ${req.params.id} (admin)...`);
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log('Get user failed: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`✅ Retrieved user: ${user.email}`);
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('❌ Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error.message
    });
  }
};

/**
 * Update user (admin only)
 * @route PUT /api/users/:id
 * @access Private/Admin
 */
exports.updateUser = async (req, res) => {
  try {
    console.log(`Updating user ID: ${req.params.id} (admin)...`);
    
    const { name, email, role, isActive, subscription } = req.body;
    
    // Check if email already exists if trying to change it
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        console.log('Update user failed: Email already exists');
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }
    
    // Create update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (subscription) updateData.subscription = subscription;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!updatedUser) {
      console.log('Update user failed: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log(`✅ User updated: ${updatedUser.email}`);
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

/**
 * Delete user (admin only)
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    console.log(`Deleting user ID: ${req.params.id} (admin)...`);
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.log('Delete user failed: User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete user's content
    await Content.deleteMany({ user: req.params.id });
    
    // Delete user
    await user.deleteOne();
    
    console.log(`✅ User deleted: ${req.params.id}`);
    
    res.status(200).json({
      success: true,
      message: 'User and all associated content deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};