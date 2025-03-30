const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');

// Public tour routes
router.get("/", tourController.getAllTours);
router.get("/featured", tourController.getFeaturedTours); 
router.get("/slug", tourController.getToursByCategorySlug);
router.get("/continent", tourController.getToursByContinent);
router.get("/search", tourController.searchTours);
router.get("/categories/:categoryId", tourController.getToursByCategory);
router.get("/regions/:region", tourController.getToursByRegion);
router.get("/:id", tourController.getTourDetails);
router.post("/:id/reviews", tourController.postTourReview);

module.exports = router;
