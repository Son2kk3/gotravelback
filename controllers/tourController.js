const { 
  Tour, 
  Category, 
  TourDetail,
  TourImage,
  TourSchedule,
  TourCategory,
  Review 
} = require("../models");

// Create a new tour
exports.create = async (req, res) => {
  try {
    const tour = new Tour(req.body);
    const savedTour = await tour.save();
    res.status(201).json(savedTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getFeaturedTours =  async (req, res) => {
  try {
    const tours = await Tour.find({ featured: true });
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getToursByCategorySlug = async (req, res) => {
  try {
    const { slug, region, continent } = req.query;
    // Find the category by slug
    const category = await Category.findOne({ slug: slug });
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Find tour_ids from the junction table
    const tourCategories = await TourCategory.find({ category_id: category._id });
    const tourIds = tourCategories.map(tc => tc.tour_id);
    
    // Find all tours with these IDs
    if (!region) {
      const tours = await Tour.find({ 
        _id: { $in: tourIds }, 
        status: 'active'
      });
      
      return res.status(200).json(tours);
    }
    const tours = await Tour.find({ 
      _id: { $in: tourIds },
      region: region, 
      status: 'active'
    });
    
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getToursByContinent = async (req, res) => {
  try {
    const { continent } = req.query;
    const tours = await Tour.find({ continent });
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// Get all tours with optional filtering
exports.findAll = async (req, res) => {
  try {
    const { region, featured, status, country, continent } = req.query;
    const filter = {};
    
    if (region) filter.region = region;
    if (featured) filter.featured = featured === 'true';
    if (status) filter.status = status;
    if (country) filter.country = country;
    if (continent) filter.continent = continent;
    
    const tours = await Tour.find(filter);
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single tour by ID
exports.findOne = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.status(200).json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a tour
exports.update = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    res.status(200).json(tour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a tour
exports.delete = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.status(200).json({ message: 'Tour deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tours with pagination
exports.getAllTours = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const tours = await Tour.find({ status: "active" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalTours = await Tour.countDocuments({ status: "active" });
    
    // For API requests
    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.json({
        tours,
        pagination: {
          total: totalTours,
          page,
          limit,
          pages: Math.ceil(totalTours / limit)
        }
      });
    }
    
    // For web page requests
    res.render("tours/index", {
      title: "All Tours",
      tours,
      pagination: {
        total: totalTours,
        page,
        limit,
        pages: Math.ceil(totalTours / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get tour details
exports.getTourDetails = async (req, res) => {
  try {
    const tourId = req.params.id;
    const tour = await Tour.findById(tourId);
    
    if (!tour) {
      return res.status(404).json({ error: "Tour not found" });
    }
    
    // Get related data
    const tourDetails = await TourDetail.findOne({ tour_id: tourId });
    const tourImages = await TourImage.find({ tour_id: tourId });
    const tourSchedule = await TourSchedule.find({ tour_id: tourId }).sort({ day_number: 1 });
    const reviews = await Review.find({ tour_id: tourId }).populate('user_id', 'full_name avatar');
    
    // Get categories
    const tourCategories = await TourCategory.find({ tour_id: tourId }).populate('category_id');
    const categories = tourCategories.map(tc => tc.category_id);
    
    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    
    // For API requests
    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.json({
        tour,
        details: tourDetails,
        images: tourImages,
        schedule: tourSchedule,
        categories,
        reviews,
        avgRating
      });
    }
    
    // For web page requests
    res.render("tours/details", {
      title: tour.title,
      tour,
      details: tourDetails,
      images: tourImages,
      schedule: tourSchedule,
      categories,
      reviews,
      avgRating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Search tours
exports.searchTours = async (req, res) => {
  try {
    const { query, region, category, minPrice, maxPrice, duration, sort, keyword: title, slug, continent } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build search filter
    const filter = { status: "active" };
    
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    if(slug){
      if(slug === "du-lich-trong-nuoc"){
        filter.country = "Việt Nam";
      }else {
        filter.country != "Việt Nam";
      }
    }

    if(continent){
      filter.continent = continent;
    }
    
    if (region) {
      filter.region = region;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (duration) {
      filter.duration = duration;
    }

    if(title){
      filter.title = { $regex: title, $options: 'i' };
    }
    
    // Handle category filtering
    let tourIds = [];
    if (category) {
      const tourCategories = await TourCategory.find({ category_id: category });
      tourIds = tourCategories.map(tc => tc.tour_id);
      filter._id = { $in: tourIds };
    }
    
    // Determine sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'rating') sortOptions = { avg_rating: -1 };
    
    const tours = await Tour.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    const totalTours = await Tour.countDocuments(filter);
    
    // For API requests
    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.json({
        tours,
        pagination: {
          total: totalTours,
          page,
          limit,
          pages: Math.ceil(totalTours / limit)
        }
      });
    }
    
    // Get all regions and categories for filtering options
    const regions = await Tour.distinct('region');
    const categories = await Category.find();
    
    // For web page requests
    res.render("tours/search", {
      title: "Search Tours",
      tours,
      regions,
      categories,
      searchParams: req.query,
      pagination: {
        total: totalTours,
        page,
        limit,
        pages: Math.ceil(totalTours / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get tours by category
exports.getToursByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Find tours in this category
    const tourCategories = await TourCategory.find({ category_id: categoryId });
    const tourIds = tourCategories.map(tc => tc.tour_id);
    
    const tours = await Tour.find({ _id: { $in: tourIds }, status: "active" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalTours = await Tour.countDocuments({ _id: { $in: tourIds }, status: "active" });
    const category = await Category.findById(categoryId);
    
    // For API requests
    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.json({
        category,
        tours,
        pagination: {
          total: totalTours,
          page,
          limit,
          pages: Math.ceil(totalTours / limit)
        }
      });
    }
    
    // For web page requests
    res.render("tours/category", {
      title: category ? `${category.name} Tours` : "Category Tours",
      category,
      tours,
      pagination: {
        total: totalTours,
        page,
        limit,
        pages: Math.ceil(totalTours / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get tours by region
exports.getToursByRegion = async (req, res) => {
  try {
    const region = req.params.region;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const tours = await Tour.find({ region, status: "active" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalTours = await Tour.countDocuments({ region, status: "active" });
    
    // For API requests
    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.json({
        region,
        tours,
        pagination: {
          total: totalTours,
          page,
          limit,
          pages: Math.ceil(totalTours / limit)
        }
      });
    }
    
    // For web page requests
    res.render("tours/region", {
      title: `${region} Tours`,
      region,
      tours,
      pagination: {
        total: totalTours,
        page,
        limit,
        pages: Math.ceil(totalTours / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Post a tour review
exports.postTourReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const tourId = req.params.id;
    const userId = req.user._id; // Assuming authentication middleware adds user to req
    
    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Valid rating is required" });
    }
    
    const newReview = new Review({
      tour_id: tourId,
      user_id: userId,
      rating: Number(rating),
      comment
    });
    
    await newReview.save();
    
    // Update average rating on tour
    const reviews = await Review.find({ tour_id: tourId });
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await Tour.findByIdAndUpdate(tourId, { avg_rating: avgRating });
    
    res.redirect(`/tours/${tourId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
