const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const tourController = require('../controllers/admin/tourController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bookingController = require('../controllers/admin/bookingController');
// const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Bảo vệ tất cả các admin routes với middleware xác thực
// router.use(isAuthenticated);
// router.use(isAdmin);

// Cấu hình multer để lưu trữ file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/tours')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Chỉ cho phép file hình ảnh!'));
    }
    cb(null, true);
  }
});

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = './public/uploads/tours';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Dashboard
router.get("/dashboard", adminController.getDashboard);

// Tour routes
router.get("/tours", tourController.index);
router.get("/tours/create", adminController.getCreateTour);
router.post("/tours/create", adminController.postCreateTour);
// router.get("/tours/:id", adminController.getTourDetails); // Comment out route cũ
router.get("/tours/:id", tourController.view); // Sử dụng controller mới
router.get("/tours/:id/edit", adminController.getEditTour);
router.post("/tours/:id/edit", adminController.postEditTour);
router.get('/tours/:id/delete', tourController.deleteTour);
router.get('/tours/:id/edit', tourController.edit);
router.post('/tours/:id/update', upload.single('thumbnail'), tourController.updateTour);
router.post('/tours/create', upload.single('thumbnail'), tourController.createTour);

// User routes
router.get("/users", adminController.getUsers);
router.get("/users/create", adminController.getCreateUser);
router.post("/users/create", adminController.postCreateUser);
router.get("/users/:id", adminController.getUserDetails);
router.get("/users/:id/edit", adminController.getEditUser);
router.post("/users/:id/edit", adminController.postEditUser);
router.get("/users/:id/delete", adminController.deleteUser);
router.post("/users/:id/delete", adminController.deleteUser);

// Category routes
router.get("/categories", adminController.getCategories);
router.get("/categories/create", adminController.getCreateCategory);
router.post("/categories/create", adminController.postCreateCategory);
router.get("/categories/:id", adminController.getCategoryDetails);
router.get("/categories/:id/edit", adminController.getEditCategory);
router.post("/categories/:id/edit", adminController.postEditCategory);
router.post("/categories/:id/delete", adminController.deleteCategory);

// Blog routes
router.get("/blogs", adminController.getBlogs);
router.get("/blogs/create", adminController.getCreateBlog);
router.post("/blogs/create", adminController.postCreateBlog);
router.get("/blogs/:id", adminController.getBlogDetails);
router.get("/blogs/:id/edit", adminController.getEditBlog);
router.post("/blogs/:id/edit", adminController.postEditBlog);
router.post("/blogs/:id/delete", adminController.deleteBlog);
router.post("/blogs/:id/update", adminController.postEditBlog);

// Booking routes
router.get("/bookings", adminController.getBookings);
router.get("/bookings/create", adminController.getCreateBooking);
router.post("/bookings/create", adminController.postCreateBooking);
router.get("/bookings/:id", adminController.getBookingDetails);
router.get("/bookings/:id/edit", adminController.getEditBooking);
router.post("/bookings/:id/edit", adminController.postEditBooking);
router.get("/bookings/:id/delete", bookingController.deleteBookingGet);
router.post("/bookings/:id/delete", adminController.deleteBooking);

module.exports = router;
