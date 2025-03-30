const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create a new user
router.post('/', userController.create);

// Get all users
router.get('/', userController.findAll);

// Get a single user by id
router.get('/:id', userController.findOne);

// Update a user
router.put('/:id', userController.update);

// Delete a user
router.delete('/:id', userController.delete);

module.exports = router;
