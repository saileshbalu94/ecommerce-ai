// routes/user.routes.js - User routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Route: Get user profile
router.get('/profile', userController.getUserProfile);

// Route: Update user profile
router.put('/profile', userController.updateUserProfile);

// Route: Update brand voice settings
router.put('/brand-voice', userController.updateBrandVoice);

// Route: Get user usage statistics
router.get('/usage', userController.getUserUsage);

// Route: Update subscription (normally handled by a payment processor webhook)
router.put('/subscription', userController.updateSubscription);

// Admin only routes
router.use(restrictTo('admin'));

// Route: Get all users (admin only)
router.get('/', userController.getAllUsers);

// Route: Get user by ID (admin only)
router.get('/:id', userController.getUserById);

// Route: Update user (admin only)
router.put('/:id', userController.updateUser);

// Route: Delete user (admin only)
router.delete('/:id', userController.deleteUser);

module.exports = router;