const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Trang đăng nhập
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Đăng xuất
router.get('/logout', authController.logout);

// Thêm route debug này
router.get('/test', (req, res) => {
  res.send('Auth route đang hoạt động!');
});

module.exports = router; 