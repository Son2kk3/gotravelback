const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricing.controller');

// Routes for tour pricing
router.get('/:tourId', pricingController.getTourPricing);
router.post('/:tourId', pricingController.addTourPricing);
router.put('/:id', pricingController.updateTourPricing);
router.delete('/:id', pricingController.deleteTourPricing);

module.exports = router;
