const express = require('express');
const router = express.Router();
const tourImageController = require('../controllers/tourImage.controller');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/tour-images');
  },
  filename: function(req, file, cb) {
    cb(null, `tour-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes for tour images
router.get('/:tourId', tourImageController.getTourImages);
router.post('/:tourId', tourImageController.addTourImage);
router.put('/:id', tourImageController.updateTourImage);
router.delete('/:id', tourImageController.deleteTourImage);

// Additional route for direct file uploads
router.post('/:tourId/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: 'No file uploaded'
      });
    }

    // Get the URL that will be used to access the file
    const imageUrl = `/uploads/tour-images/${req.file.filename}`;
    
    // Add this URL to the request body so the controller can use it
    req.body.image_url = imageUrl;
    
    // Forward to the regular add image controller
    tourImageController.addTourImage(req, res);
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

module.exports = router;
