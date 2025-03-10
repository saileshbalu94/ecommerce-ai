// routes/content.routes.js - Content generation routes
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const contentController = require('../controllers/content.controller');
const { protect, checkSubscription } = require('../middleware/auth.middleware');

// All routes are protected and require an active subscription
router.use(protect);
router.use(checkSubscription);

// Route: Generate product description
router.post('/generate/description', contentController.generateDescription);

// Route: Generate product title
router.post('/generate/title', contentController.generateTitle);

// Route: Generate alternatives for existing content
router.post('/generate/alternatives', contentController.generateAlternatives);

// Route: Save generated content
router.post('/save', contentController.saveContent);

// Route: Get all content for a user
router.get('/', contentController.getUserContent);

// Route: Get a specific content by ID
router.get('/:id', contentController.getContentById);

// Route: Update content
router.put('/:id', contentController.updateContent);

// Route: Add feedback to content
router.post('/:id/feedback', contentController.addFeedback);

// Route: Delete content
router.delete('/:id', contentController.deleteContent);

module.exports = router;