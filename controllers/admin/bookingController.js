const { Booking, Tour, User } = require('../../models');

// Hiển thị danh sách bookings
exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Lấy các tham số tìm kiếm từ query
    const status = req.query.status;
    const search = req.query.search;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    // Tạo filter
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { contact_name: { $regex: search, $options: 'i' } },
        { contact_email: { $regex: search, $options: 'i' } },
        { contact_phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate) {
      filter.createdAt = filter.createdAt || {};
      filter.createdAt.$gte = new Date(startDate);
    }
    
    if (endDate) {
      filter.createdAt = filter.createdAt || {};
      filter.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }
    
    // Lấy danh sách bookings
    const bookings = await Booking.find(filter)
      .populate('user_id', 'email fullname')
      .populate('tour_id', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalBookings = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / limit);
    
    res.render('admin/bookings/index', { 
      bookings, 
      page, 
      limit, 
      totalPages, 
      status,
      search,
      startDate,
      endDate
    });
  } catch (error) {
    console.error('Error loading bookings:', error);
    res.status(500).send('Server Error');
  }
};

// Thêm hàm này vào controller
exports.deleteBookingGet = async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Kiểm tra booking tồn tại
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).send('Booking không tồn tại');
    }
    
    // Xóa booking
    await Booking.findByIdAndDelete(bookingId);
    
    // Chuyển hướng về trang danh sách bookings với thông báo
    res.redirect('/admin/bookings?message=Xóa+booking+thành+công&type=success');
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.redirect('/admin/bookings?message=Đã+xảy+ra+lỗi+khi+xóa+booking&type=error');
  }
}; 