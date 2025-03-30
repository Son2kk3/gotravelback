const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

// Tất cả các routes đều yêu cầu xác thực
// router.use(authenticateToken);

// Lấy tất cả booking của người dùng hiện tại
router.get('/:user_id', bookingController.getUserBookings);

// Lấy chi tiết một booking
router.get('/:id', bookingController.getBookingById);

// Tạo booking mới
router.post('/', bookingController.createBooking);

// Cập nhật booking (chỉ một số trường cụ thể)
router.put('/:id', bookingController.updateBooking);

// Hủy booking
router.patch('/:id/cancel', bookingController.cancelBooking);

module.exports = router; 