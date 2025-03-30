const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');


// router.post('/', userController.create);

// Get all posts
router.get('/', postController.findAll);

router.get('/:slug', postController.getPostBySlug);

// Get a single user by id
// router.get('/:id', userController.findOne);

// Update a user
// router.put('/:id', userController.update);

// Delete a user
// router.delete('/:id', userController.delete);

module.exports = router;
