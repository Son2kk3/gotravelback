const { Tour, TourDetail, TourImage, TourSchedule, Pricing } = require('../../models');

// Hiển thị danh sách tour
exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const tours = await Tour.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalTours = await Tour.countDocuments();
    const totalPages = Math.ceil(totalTours / limit);
    
    res.render('admin/tours/index', { 
      tours, 
      page, 
      limit, 
      totalPages, 
      admin: req.user  // Pass the admin user info
    });
  } catch (error) {
    console.error('Error loading tours:', error);
    res.status(500).send('Server Error');
  }
};

// Hiển thị chi tiết tour
exports.view = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).send('Tour not found');
    }
    
    const tourDetail = await TourDetail.findOne({ tour_id: tour._id });
    const tourImages = await TourImage.find({ tour_id: tour._id }).sort({ display_order: 1 });
    const tourSchedules = await TourSchedule.find({ tour_id: tour._id }).sort({ day: 1 });
    const pricing = await Pricing.find({ tour_id: tour._id });
    
    res.render('admin/tours/view', { 
      tour, 
      tourDetail, 
      tourImages, 
      tourSchedules, 
      pricing
    });
  } catch (error) {
    console.error('Error loading tour details:', error);
    res.status(500).send('Server Error');
  }
};

// Hiển thị form tạo tour mới
exports.create = async (req, res) => {
  res.render('admin/tours/edit', { 
    tour: null,
    title: 'Thêm Tour mới',
    active: 'tours',
    admin: req.user  // Thêm dòng này
  });
};

// Hiển thị form chỉnh sửa tour
exports.edit = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).send('Tour not found');
    }
    
    res.render('admin/tours/edit', { 
      tour,
      title: 'Chỉnh sửa Tour',
      active: 'tours',
      admin: req.user  // Thêm dòng này
    });
  } catch (error) {
    console.error('Error loading tour for edit:', error);
    res.status(500).send('Server Error');
  }
};

// Xóa tour
exports.deleteTour = async (req, res) => {
  try {
    const tourId = req.params.id;
    
    // Kiểm tra tour tồn tại
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).send('Tour không tồn tại');
    }
    
    // Xóa tour
    await Tour.findByIdAndDelete(tourId);
    
    // Xóa các thông tin liên quan (nếu cần)
    await TourDetail.deleteMany({ tour_id: tourId });
    await TourImage.deleteMany({ tour_id: tourId });
    await TourSchedule.deleteMany({ tour_id: tourId });
    await Pricing.deleteMany({ tour_id: tourId });
    
    // Chuyển hướng với thông báo thành công
    res.redirect('/admin/tours?message=Xóa+tour+thành+công&type=success');
  } catch (error) {
    console.error('Error deleting tour:', error);
    
    // Chuyển hướng với thông báo lỗi
    res.redirect('/admin/tours?message=Đã+xảy+ra+lỗi+khi+xóa+tour&type=error');
  }
};

// Cập nhật tour
exports.updateTour = async (req, res) => {
  try {
    const tourId = req.params.id;
    
    // Lấy dữ liệu từ form
    const { 
      title, description, price, original_price, discount, 
      duration, region, country, vehicle, schedule, status 
    } = req.body;
    
    // Kiểm tra tour tồn tại
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).send('Tour không tồn tại');
    }
    
    // Xử lý featured (checkbox)
    const featured = req.body.featured === 'on' ? true : false;
    
    // Xử lý thumbnail nếu có file mới được upload
    let thumbnail = tour.thumbnail;
    if (req.file) {
      // Code xử lý upload file
      thumbnail = '/uploads/tours/' + req.file.filename;
    }
    
    // Cập nhật dữ liệu tour
    const updatedTour = await Tour.findByIdAndUpdate(tourId, {
      title,
      description,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : undefined,
      discount: discount ? parseFloat(discount) : 0,
      duration,
      schedule,
      region,
      country,
      vehicle,
      featured,
      thumbnail,
      status
    }, { new: true });
    
    res.redirect('/admin/tours/' + tourId);
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).send('Đã xảy ra lỗi khi cập nhật tour');
  }
};

// Tạo tour mới (thêm nếu chưa có)
exports.createTour = async (req, res) => {
  try {
    // Lấy dữ liệu từ form
    const { 
      title, description, price, original_price, discount, 
      duration, region, country, vehicle, schedule, status 
    } = req.body;
    
    // Xử lý featured (checkbox)
    const featured = req.body.featured === 'on' ? true : false;
    
    // Xử lý thumbnail nếu có file upload
    let thumbnail = '';
    if (req.file) {
      // Code xử lý upload file
      thumbnail = '/uploads/tours/' + req.file.filename;
    }
    
    // Tạo tour mới
    const newTour = new Tour({
      title,
      description,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : undefined,
      discount: discount ? parseFloat(discount) : 0,
      duration,
      schedule,
      region,
      country,
      vehicle,
      featured,
      thumbnail,
      status: status || 'active'
    });
    
    await newTour.save();
    
    res.redirect('/admin/tours/' + newTour._id);
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).send('Đã xảy ra lỗi khi tạo tour mới');
  }
};

// Controller tương tự cần triển khai cho các khu vực blog, user, booking 