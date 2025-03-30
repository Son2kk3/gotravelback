const express = require('express');
const router = express.Router();
const tourDetailController = require('../controllers/tourDetailController');

// Create a new tour detail
router.post('/', tourDetailController.create);

// Get all tour details
router.get('/', tourDetailController.findAll);
router.get('/:tourId', tourDetailController.findTourDetailById);

// Get tour detail by tour ID
router.get('/tour/:tourId', tourDetailController.findByTourId);

// Get a single tour detail by id
router.get('/:id', tourDetailController.findOne);

// Update a tour detail
router.put('/:id', tourDetailController.update);

// Delete a tour detail
router.delete('/:id', tourDetailController.delete);

module.exports = router;
