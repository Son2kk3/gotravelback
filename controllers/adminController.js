const { 
  User, 
  Tour, 
  Category, 
  TourDetail,
  TourImage,
  TourSchedule,
  TourCategory,
  Pricing,
  Booking,
  Review,
  BlogPost 
} = require("../models");
const mongoose = require('mongoose');

// Dashboard controller
exports.getDashboard = (req, res) => {
  res.render("admin/dashboard", {
    title: "Admin Dashboard"
  });
};

// Tour controllers
exports.getCreateTour = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("admin/tours/create", {
      title: "Create New Tour",
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.postCreateTour = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      original_price,
      discount,
      duration,
      vehicle,
      schedule,
      region,
      continent,
      country,
      thumbnail,
      featured,
      categoryIds,
      // Tour details
      highlights,
      included,
      excluded,
      policy,
      orderTitleContent,
      adult_price,
      child_price,
      infant_price
    } = req.body;

    // Create tour
    const newTour = new Tour({
      title,
      description,
      price: Number(price),
      original_price: original_price ? Number(original_price) : undefined,
      discount: discount ? Number(discount) : undefined,
      duration,
      schedule,
      region,
      continent,
      country,
      vehicle,
      thumbnail,
      featured: featured === "on" ? true : false
    });

    const tour = await newTour.save();

    // Create tour details
    if (highlights || included || excluded || policy) {
      const tourDetail = new TourDetail({
        tour_id: tour._id,
        highlights,
        included,
        excluded,
        policy
      });
      await tourDetail.save();
    }

    // Create pricing
    if(adult_price) {
      const adultPricing = new Pricing({
        tour_id: tour._id,
        type: 'adult',
        price: Number(adult_price)
      });
      await adultPricing.save();
    }

    if(child_price) {
      const childPricing = new Pricing({
        tour_id: tour._id,
        type: 'child',
        price: Number(child_price)
      });
      await childPricing.save();
    }

    if(infant_price) {
      const infantPricing = new Pricing({
        tour_id: tour._id,
        type: 'infant',
        price: Number(infant_price)
      });
      await infantPricing.save();
    }

    if(orderTitleContent) {
      const scheduleArr = orderTitleContent.split(';');
      scheduleArr.forEach(async (item, index) => {
        const data = item.split('/');
        const newSchedule = new TourSchedule({
          tour_id: tour._id,
          day: data[0],
          title: data[1],
          content: data[2],
        });
        await newSchedule.save();
      });
    }

    // Add categories
    if (categoryIds && categoryIds.length) {
      const categoriesToAdd = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      
      for (const catId of categoriesToAdd) {
        await new TourCategory({
          tour_id: tour._id,
          category_id: catId
        }).save();
      }
    }

    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error: " + error.message);
  }
};

// Tour listing and management
exports.getTours = async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.render("admin/tours/index", {
      title: "Manage Tours",
      tours
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.getTourDetails = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    const tourDetails = await TourDetail.findOne({ tour_id: req.params.id });
    const tourCategories = await TourCategory.find({ tour_id: req.params.id }).populate('category_id');
    
    res.render("admin/tours/view", {
      title: tour.title,
      tour,
      tourDetails,
      categories: tourCategories.map(tc => tc.category_id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.getEditTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    const tourDetails = await TourDetail.findOne({ tour_id: req.params.id });
    const categories = await Category.find();
    const tourCategories = await TourCategory.find({ tour_id: req.params.id });
    
    res.render("admin/tours/edit", {
      title: `Edit ${tour.title}`,
      tour,
      tourDetails,
      categories,
      selectedCategories: tourCategories.map(tc => tc.category_id.toString())
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.postEditTour = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      original_price,
      discount,
      duration,
      schedule,
      region,
      continent,
      country,
      thumbnail,
      featured,
      categoryIds,
      highlights,
      included,
      excluded,
      policy
    } = req.body;

    // Update tour
    await Tour.findByIdAndUpdate(req.params.id, {
      title,
      description,
      price: Number(price),
      original_price: original_price ? Number(original_price) : undefined,
      discount: discount ? Number(discount) : undefined,
      duration,
      schedule,
      region,
      continent,
      country,
      thumbnail,
      featured: featured === "on" ? true : false
    });

    // Update or create tour details
    const tourDetails = await TourDetail.findOne({ tour_id: req.params.id });
    if (tourDetails) {
      await TourDetail.updateOne({ tour_id: req.params.id }, {
        highlights,
        included,
        excluded,
        policy
      });
    } else if (highlights || included || excluded || policy) {
      const newTourDetail = new TourDetail({
        tour_id: req.params.id,
        highlights,
        included,
        excluded,
        policy
      });
      await newTourDetail.save();
    }

    // Update categories
    await TourCategory.deleteMany({ tour_id: req.params.id });
    if (categoryIds && categoryIds.length) {
      const categoriesToAdd = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      for (const catId of categoriesToAdd) {
        await new TourCategory({
          tour_id: req.params.id,
          category_id: catId
        }).save();
      }
    }

    res.redirect("/admin/tours");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error: " + error.message);
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    await TourDetail.deleteMany({ tour_id: req.params.id });
    await TourCategory.deleteMany({ tour_id: req.params.id });
    
    res.redirect("/admin/tours");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// User controllers
exports.getCreateUser = (req, res) => {
  res.render("admin/users/create", {
    title: "Create New User"
  });
};

exports.postCreateUser = async (req, res) => {
  try {
    const { email, password, full_name, phone, avatar, address, role } = req.body;
    
    // Validate required fields
    if (!email || email.trim() === '') {
      return res.status(400).render('admin/users/create', {
        title: "Create New User",
        error: 'Email is required',
        userData: req.body
      });
    }
    
    // Create new user
    const newUser = new User({
      email,
      password,
      full_name,
      phone,
      avatar,
      address,
      role: role || 'user'
    });
    
    await newUser.save();
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).render('admin/users/create', {
      title: "Create New User",
      error: error.message,
      userData: req.body
    });
  }
};

// User listing and management
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render("admin/users/index", {
      title: "Manage Users",
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).send('Người dùng không tồn tại');
    }
    
    // Lấy danh sách bookings của người dùng
    const bookings = await Booking.find({ user_id: user._id })
      .populate('tour_id', 'title')
      .sort({ createdAt: -1 })
      .limit(10); // Giới hạn 10 booking gần nhất
    
    res.render("admin/users/view", {
      title: user.fullname || user.email,
      user,
      bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.getEditUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("admin/users/edit", {
      title: `Edit ${user.full_name || user.email}`,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.postEditUser = async (req, res) => {
  try {
    const { email, full_name, phone, avatar, address, role } = req.body;
    const updateData = { email, full_name, phone, avatar, address, role };
    
    // Only include password in update if it's provided
    if (req.body.password && req.body.password.trim() !== '') {
      updateData.password = req.body.password;
    }
    
    await User.findByIdAndUpdate(req.params.id, updateData);
    res.redirect("/admin/users");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/admin/users");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Category controllers
exports.getCreateCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("admin/categories/create", {
      title: "Create New Category",
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.postCreateCategory = async (req, res) => {
  try {
    const { name, slug, parent_id } = req.body;
    
    const newCategory = new Category({
      name,
      slug,
      parent_id: parent_id || undefined
    });
    
    await newCategory.save();
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error: " + error.message);
  }
};

// Category listing and management
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.render("admin/categories/index", {
      title: "Manage Categories",
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.getCategoryDetails = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    const subCategories = await Category.find({ parent_id: req.params.id });
    res.render("admin/categories/view", {
      title: category.name,
      category,
      subCategories
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.getEditCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    const categories = await Category.find({ _id: { $ne: req.params.id } });
    res.render("admin/categories/edit", {
      title: `Edit ${category.name}`,
      category,
      categories
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.postEditCategory = async (req, res) => {
  try {
    const { name, slug, parent_id } = req.body;
    await Category.findByIdAndUpdate(req.params.id, {
      name,
      slug,
      parent_id: parent_id || undefined
    });
    res.redirect("/admin/categories");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    // Also update any subcategories to remove parent reference
    await Category.updateMany({ parent_id: req.params.id }, { parent_id: undefined });
    res.redirect("/admin/categories");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Blog controllers
exports.getCreateBlog = async (req, res) => {
  try {
    const users = await User.find({ occupation: "admin" });
    res.render("admin/blogs/create", {
      title: "Create New Blog Post",
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.postCreateBlog = async (req, res) => {
  try {
    const { title, slug, excerpt, content, thumbnail, author, status } = req.body;
    
    const newBlog = new BlogPost({
      title,
      slug,
      excerpt,
      content,
      thumbnail,
      author,
      status: status || "draft"
    });
    
    await newBlog.save();
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error: " + error.message);
  }
};

// Blog listing and management
exports.getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const blogs = await BlogPost.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalBlogs = await BlogPost.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);
    
    res.render("admin/blogs/index", {
      blogs,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error("Error loading blogs:", error);
    res.status(500).send("Server error");
  }
};

exports.getBlogDetails = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Kiểm tra ID hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('ID blog không hợp lệ');
    }
    
    const blog = await BlogPost.findById(id);
    
    if (!blog) {
      return res.status(404).send('Bài viết không tồn tại');
    }
    
    res.render("admin/blogs/view", {
      blog
    });
  } catch (error) {
    console.error("Error loading blog details:", error);
    res.status(500).send("Server error: " + error.message);
  }
};

exports.getEditBlog = async (req, res) => {
  try {
    const blog = await BlogPost.findById(req.params.id);
    const users = await User.find({ role: "admin" });
    res.render("admin/blogs/edit", {
      title: `Edit ${blog.title}`,
      blog,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.postEditBlog = async (req, res) => {
  try {
    const { title, slug, excerpt, content, thumbnail, author_id, status } = req.body;
    await BlogPost.findByIdAndUpdate(req.params.id, {
      title,
      slug,
      excerpt,
      content,
      thumbnail,
      author_id,
      status
    });
    res.redirect("/admin/blogs");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.redirect("/admin/blogs");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Booking controllers
exports.getCreateBooking = async (req, res) => {
  try {
    const users = await User.find();
    const tours = await Tour.find({ status: "active" });
    res.render("admin/bookings/create", {
      title: "Create New Booking",
      users,
      tours
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.postCreateBooking = async (req, res) => {
  try {
    const {
      user_id,
      tour_id,
      booking_date,
      status,
      total_price,
      adult_count,
      child_count,
      infant_count,
      contact_name,
      contact_email,
      contact_phone,
      special_request,
      payment_method
    } = req.body;
    
    const newBooking = new Booking({
      user_id,
      tour_id,
      booking_date: new Date(booking_date),
      status: status || "pending",
      total_price: Number(total_price),
      adult_count: Number(adult_count) || 0,
      child_count: Number(child_count) || 0,
      infant_count: Number(infant_count) || 0,
      contact_name,
      contact_email,
      contact_phone,
      special_request,
      payment_method,
      payment_status: "pending"
    });
    
    await newBooking.save();
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error: " + error.message);
  }
};

// Booking listing and management
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ booking_date: -1 }).populate('user_id').populate('tour_id');
    res.render("admin/bookings/index", {
      title: "Manage Bookings",
      bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tour_id')
      .populate('user_id', '-password');
    
    if (!booking) {
      return res.status(404).send('Booking không tồn tại');
    }
    
    res.render('admin/bookings/view', { booking });
  } catch (error) {
    console.error('Error loading booking details:', error);
    res.status(500).send('Server Error');
  }
};

exports.getEditBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    const users = await User.find();
    const tours = await Tour.find({ status: "active" });
    res.render("admin/bookings/edit", {
      title: `Edit Booking #${booking._id}`,
      booking,
      users,
      tours
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.postEditBooking = async (req, res) => {
  try {
    const {
      user_id,
      tour_id,
      booking_date,
      status,
      total_price,
      adult_count,
      child_count,
      infant_count,
      contact_name,
      contact_email,
      contact_phone,
      special_request,
      payment_method,
      payment_status
    } = req.body;
    
    await Booking.findByIdAndUpdate(req.params.id, {
      user_id,
      tour_id,
      booking_date: new Date(booking_date),
      status,
      total_price: Number(total_price),
      adult_count: Number(adult_count) || 0,
      child_count: Number(child_count) || 0,
      infant_count: Number(infant_count) || 0,
      contact_name,
      contact_email,
      contact_phone,
      special_request,
      payment_method,
      payment_status
    });
    
    res.redirect("/admin/bookings");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.redirect("/admin/bookings");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};


