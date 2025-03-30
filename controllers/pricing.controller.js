const { Pricing, Tour } = require('../models/index');

module.exports = {
  // Get all pricing options for a specific tour
  getTourPricing: async (req, res) => {
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
      
      const pricing = await Pricing.find({ tour_id: tourId });
      
      return res.status(200).json({
        status: 200,
        message: 'Success',
        data: pricing
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Server error',
        error: error.message
      });
    }
  },
  
  // Add new pricing option to a tour
  addTourPricing: async (req, res) => {
    try {
      const { tourId } = req.params;
      const { type, price } = req.body;
      
      // Validation
      if (!type || !price) {
        return res.status(400).json({
          status: 400,
          message: 'Type and price are required'
        });
      }
      
      if (!['adult', 'child', 'infant'].includes(type)) {
        return res.status(400).json({
          status: 400,
          message: 'Type must be one of: adult, child, infant'
        });
      }
      
      if (isNaN(price) || price < 0) {
        return res.status(400).json({
          status: 400,
          message: 'Price must be a valid positive number'
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
      
      // Check if pricing for this type already exists
      const existingPricing = await Pricing.findOne({ 
        tour_id: tourId,
        type: type
      });
      
      if (existingPricing) {
        return res.status(400).json({
          status: 400,
          message: `Pricing for ${type} already exists for this tour. Use update instead.`
        });
      }
      
      // Create new pricing
      const newPricing = await Pricing.create({
        tour_id: tourId,
        type,
        price
      });
      
      return res.status(201).json({
        status: 201,
        message: 'Tour pricing added successfully',
        data: newPricing
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Server error',
        error: error.message
      });
    }
  },
  
  // Update pricing option
  updateTourPricing: async (req, res) => {
    try {
      const { id } = req.params;
      const { price } = req.body;
      
      // Validation
      if (!price || isNaN(price) || price < 0) {
        return res.status(400).json({
          status: 400,
          message: 'Valid price is required'
        });
      }
      
      const updatedPricing = await Pricing.findByIdAndUpdate(
        id,
        { price },
        { new: true }
      );
      
      if (!updatedPricing) {
        return res.status(404).json({
          status: 404,
          message: 'Pricing not found'
        });
      }
      
      return res.status(200).json({
        status: 200,
        message: 'Tour pricing updated successfully',
        data: updatedPricing
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: 'Server error',
        error: error.message
      });
    }
  },
  
  // Delete pricing option
  deleteTourPricing: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedPricing = await Pricing.findByIdAndDelete(id);
      if (!deletedPricing) {
        return res.status(404).json({
          status: 404,
          message: 'Pricing not found'
        });
      }
      
      return res.status(200).json({
        status: 200,
        message: 'Tour pricing deleted successfully'
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
