const express = require('express');
const router = express.Router();
const brandVoiceController = require('../controllers/brandVoice.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all brand voice routes
router.use(authMiddleware.authenticateUser);

// Route to create a new brand voice
router.post('/brand-voices', brandVoiceController.createBrandVoice);

// Route to get all brand voices
router.get('/brand-voices', brandVoiceController.getBrandVoices);

// Route to update a brand voice
router.put('/brand-voices/:id', brandVoiceController.updateBrandVoice);

// Route to delete a brand voice
router.delete('/brand-voices/:id', brandVoiceController.deleteBrandVoice);

// Route to get a brand voice by ID
router.get('/brand-voices/:id', brandVoiceController.getBrandVoiceById);

module.exports = router; 