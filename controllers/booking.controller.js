const { Booking, Tour, User, Pricing } = require('../models');

// Lấy tất cả booking của người dùng hiện tại
exports.getUserBookings = async (req, res) => {
  try {
    // const { user_id } = req.params.user_id;
    console.log(req.params.user_id);
    const bookings = await Booking.find({ user_id: req.params.user_id })
      .populate('tour_id')
      .sort({ booking_date: -1 });
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Lỗi khi lấy bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách booking'
    });
  }
};

// Lấy chi tiết một booking
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tour_id')
      .populate('user_id', '-password');
      
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Kiểm tra nếu booking không thuộc về người dùng hiện tại và người dùng không phải admin
    if (booking.user_id._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem booking này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết booking:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông tin booking'
    });
  }
};

// Tạo booking mới
exports.createBooking = async (req, res) => {
  try {
    const {
      user_id,
      tour_id,
      booking_date,
      adult_count,
      child_count,
      infant_count,
      contact_name,
      contact_email,
      contact_phone,
      special_request,
      payment_method
    } = req.body;
    
    // Kiểm tra tour tồn tại
    const tour = await Tour.findById(tour_id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour không tồn tại'
      });
    }
    
    // Tính tổng giá
    let total_price = 0;
    
    // Lấy pricing từ database
    const adultPricing = await Pricing.findOne({ tour_id, type: 'adult' });
    const childPricing = await Pricing.findOne({ tour_id, type: 'child' });
    const infantPricing = await Pricing.findOne({ tour_id, type: 'infant' });
    
    if (adultPricing) {
      total_price += adultPricing.price * (parseInt(adult_count) || 0);
    } else {
      total_price += tour.price * (parseInt(adult_count) || 0);
    }
    
    if (childPricing) {
      total_price += childPricing.price * (parseInt(child_count) || 0);
    }
    
    if (infantPricing) {
      total_price += infantPricing.price * (parseInt(infant_count) || 0);
    }
    
    // Tạo booking mới
    const newBooking = new Booking({
      user_id,
      tour_id,
      booking_date: new Date(booking_date),
      status: 'pending',
      total_price,
      adult_count: parseInt(adult_count) || 0,
      child_count: parseInt(child_count) || 0,
      infant_count: parseInt(infant_count) || 0,
      contact_name,
      contact_email,
      contact_phone,
      special_request,
      payment_method,
      payment_status: 'pending'
    });
    
    await newBooking.save();
    
    res.status(201).json({
      success: true,
      message: 'Đặt tour thành công',
      data: newBooking
    });
  } catch (error) {
    console.error('Lỗi khi tạo booking:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đặt tour'
    });
  }
};

// Cập nhật booking (chỉ một số trường được phép cập nhật bởi người dùng)
exports.updateBooking = async (req, res) => {
  try {
    const { special_request } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }
    
    // Kiểm tra quyền sở hữu booking
    if (booking.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật booking này'
      });
    }
    
    // Kiểm tra trạng thái booking, chỉ cho phép cập nhật nếu còn đang pending hoặc confirmed
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật booking đã hoàn thành hoặc đã hủy'
      });
    }
    
    // Cập nhật thông tin được phép
    booking.special_request = special_request;
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật booking thành công',
      data: booking
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật booking:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật booking'
    });
  }
};

// Hủy booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Hủy booking thành công',
      data: booking
    });
  } catch (error) {
    console.error('Lỗi khi hủy booking:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi hủy booking'
    });
  }
}; 