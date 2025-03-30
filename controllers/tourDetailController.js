const { TourDetail, Tour, Pricing, TourSchedule } = require('../models');
const mongoose = require("mongoose");

// Create a new tour detail
exports.create = async (req, res) => {
  try {
    const tourDetail = new TourDetail(req.body);
    const savedTourDetail = await tourDetail.save();
    res.status(201).json(savedTourDetail);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all tour details
exports.findAll = async (req, res) => {
  try {
    const tourDetails = await TourDetail.find();
    
    res.status(200).json(tourDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// exports.findTourDetailById = async (req, res) => {
//   try {
//     // Find all tour details and populate with the associated tour information
//     const { tour_id } = req.params;
//     const tourDetails = await TourDetail.find()
//       .populate({
//         path: 'tour_id',
//         model: 'tours'
//       });
    
//     // Format the response to make it more readable
//     // const formattedResults = tourDetails.map(detail => {
//     //   return {
//     //     id: detail._id,
//     //     tour: {
//     //       id: detail.tour_id._id,
//     //       title: detail.tour_id.title,
//     //       price: detail.tour_id.price,
//     //       duration: detail.tour_id.duration,
//     //       region: detail.tour_id.region,
//     //       thumbnail: detail.tour_id.thumbnail,
//     //       status: detail.tour_id.status
//     //     },
//     //     details: {
//     //       highlights: detail.highlights,
//     //       included: detail.included,
//     //       excluded: detail.excluded,
//     //       policy: detail.policy
//     //     },
//     //     createdAt: detail.createdAt,
//     //     updatedAt: detail.updatedAt
//     //   };
//     // });
    
//     res.status(200).json(tourDetails);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

exports.findTourDetailById = async (req, res) => {
  try {
    const { tourId: tour_id } = req.params;
    console.log("tour_id", tour_id);
    
    // const tourIdObj = mongoose.Types.ObjectId(tour_id);
    // // // Validate that tour_id is a valid ObjectId
    // if (!mongoose.Types.ObjectId.isValid(tourIdObj)) {
    //   return res.status(400).json({ message: "Invalid tour ID format" });
    // }
    
    // // Find the specific tour detail by tour_id and populate tour information
    // const tourDetail = await TourDetail.findOne({ tour_id: tourIdObj })
    //   .populate({
    //     path: 'tour_id',
    //     model: 'tours'
    //   });
    
    // if (!tourDetail) {
    //   return res.status(404).json({ message: "Tour details not found for this tour" });
    // }
    
    // res.status(200).json(tourDetail);
    const tour = await Tour.findOne({ _id: tour_id });
    const tourDetail = await TourDetail.findOne({ tour_id: tour._id });
    const pricing = await Pricing.find({ tour_id: tour._id });
    // const schedule = await TourSchedule.find({ tour_id: tour._id });
    const schedule = await TourSchedule.find({ tour_id: tour._id }).sort({ day: 1 });
    const tourMergr = { ...tour._doc, ...tourDetail._doc };
    if (!tourMergr) {
      return res.status(404).json({ message: 'Tour detail not found' });
    }
    res.status(200).json({ tour: tourMergr, pricing, schedule });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get tour detail by ID
exports.findOne = async (req, res) => {
  try {
    const tourDetail = await TourDetail.findById(req.params.id);
    if (!tourDetail) {
      return res.status(404).json({ message: 'Tour detail not found' });
    }
    res.status(200).json(tourDetail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tour detail by tour_id
exports.findByTourId = async (req, res) => {
  try {
    const tourDetail = await TourDetail.findOne({ tour_id: req.params.tourId });
    if (!tourDetail) {
      return res.status(404).json({ message: 'Tour detail not found' });
    }
    res.status(200).json(tourDetail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a tour detail
exports.update = async (req, res) => {
  try {
    const tourDetail = await TourDetail.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!tourDetail) {
      return res.status(404).json({ message: 'Tour detail not found' });
    }
    
    res.status(200).json(tourDetail);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a tour detail
exports.delete = async (req, res) => {
  try {
    const tourDetail = await TourDetail.findByIdAndDelete(req.params.id);
    if (!tourDetail) {
      return res.status(404).json({ message: 'Tour detail not found' });
    }
    res.status(200).json({ message: 'Tour detail deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
