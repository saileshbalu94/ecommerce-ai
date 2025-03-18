// routes/marketing.routes.js - Marketing campaign routes
const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketing.controller');
const { protect, checkSubscription } = require('../middleware/auth.middleware');

// All routes are protected and require an active subscription
router.use(protect);
router.use(checkSubscription);

// Campaign Management Routes
router.post('/campaigns', marketingController.createCampaign);
router.get('/campaigns', marketingController.getCampaigns);
router.get('/campaigns/:id', marketingController.getCampaignById);
router.put('/campaigns/:id', marketingController.updateCampaign);
router.delete('/campaigns/:id', marketingController.deleteCampaign);

// Google Ads Generation Routes
router.post('/generate/google-ads/responsive-search', marketingController.generateResponsiveSearchAd);
router.post('/generate/google-ads/performance-max', marketingController.generatePerformanceMaxAd);
router.post('/generate/google-ads/extensions', marketingController.generateAdExtensions);

// Google Ads Content Management Routes
router.get('/google-ads-content/:campaignId', marketingController.getGoogleAdsContent);
router.put('/google-ads-content/:id', marketingController.updateGoogleAdsContent);
router.delete('/google-ads-content/:id', marketingController.deleteGoogleAdsContent);

module.exports = router; 