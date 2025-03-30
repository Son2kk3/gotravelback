const { TourImage, Tour } = require('../models/index');

module.exports = {
  // Get all images for a specific tour
  getTourImages: async (req, res) => {
    try {
      const { tourId } = req.params;
      
      // Check if tour exists
      const tourExists = await Tour.findById(tourId);
      if (!tourExists) {
        return res.status(404).json({
          status: 404,
          message: 'Tour not found'
        });
      }
      
      const images = await TourImage.find({ tour_id: tourId })
        .sort({ display_order: 1 });
      
      return res.status(200).json({
        status: 200,
        message: 'Success',
        data: images
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Server error',
        error: error.message
      });
    }
  },
  
  // Add a new image to a tour
  addTourImage: async (req, res) => {
    try {
      const { tourId } = req.params;
      const { image_url, display_order } = req.body;
      
      // Validation
      if (!image_url) {
        return res.status(400).json({
          status: 400,
          message: 'Image URL is required'
        });
      }
      
      // Check if tour exists
      const tourExists = await Tour.findById(tourId);
      if (!tourExists) {
        return res.status(404).json({
          status: 404,
          message: 'Tour not found'
        });
      }
      
      // Find the highest display order if not provided
      let orderToUse = display_order;
      if (!orderToUse) {
        const lastImage = await TourImage.findOne({ tour_id: tourId })
          .sort({ display_order: -1 });
        orderToUse = lastImage ? lastImage.display_order + 1 : 1;
      }
      
      // Create new tour image
      const newTourImage = await TourImage.create({
        tour_id: tourId,
        image_url,
        display_order: orderToUse
      });
      
      return res.status(201).json({
        status: 201,
        message: 'Tour image added successfully',
        data: newTourImage
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Server error',
        error: error.message
      });
    }
  },
  
  // Delete a tour image
  deleteTourImage: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedImage = await TourImage.findByIdAndDelete(id);
      if (!deletedImage) {
        return res.status(404).json({
          status: 404,
          message: 'Image not found'
        });
      }
      
      return res.status(200).json({
        status: 200,
        message: 'Tour image deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Server error',
        error: error.message
      });
    }
  },
  
  // Update display order of an image
  updateTourImage: async (req, res) => {
    try {
      const { id } = req.params;
      const { display_order } = req.body;
      
      const updatedImage = await TourImage.findByIdAndUpdate(
        id,
        { display_order },
        { new: true }
      );
      
      if (!updatedImage) {
        return res.status(404).json({
          status: 404,
          message: 'Image not found'
        });
      }
      
      return res.status(200).json({
        status: 200,
        message: 'Tour image updated successfully',
        data: updatedImage
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Server error',
        error: error.message
      });
    }
  }
};
