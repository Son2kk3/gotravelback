const { TourImage } = require('../models');

// Create a new tour image
exports.create = async (req, res) => {
  try {
    const tourImage = new TourImage(req.body);
    const savedTourImage = await tourImage.save();
    res.status(201).json(savedTourImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all tour images
exports.findAll = async (req, res) => {
  try {
    const tourImages = await TourImage.find();
    res.status(200).json(tourImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tour images by tour ID
exports.findByTourId = async (req, res) => {
  try {
    const tourImages = await TourImage.find({ tour_id: req.params.tourId })
      .sort({ display_order: 1 });
    res.status(200).json(tourImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single tour image
exports.findOne = async (req, res) => {
  try {
    const tourImage = await TourImage.findById(req.params.id);
    if (!tourImage) {
      return res.status(404).json({ message: 'Tour image not found' });
    }
    res.status(200).json(tourImage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a tour image
exports.update = async (req, res) => {
  try {
    const tourImage = await TourImage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!tourImage) {
      return res.status(404).json({ message: 'Tour image not found' });
    }
    
    res.status(200).json(tourImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a tour image
exports.delete = async (req, res) => {
  try {
    const tourImage = await TourImage.findByIdAndDelete(req.params.id);
    if (!tourImage) {
      return res.status(404).json({ message: 'Tour image not found' });
    }
    res.status(200).json({ message: 'Tour image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
