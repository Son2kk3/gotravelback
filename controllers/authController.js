const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hiển thị trang đăng nhập
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Đăng nhập'
  });
};

// Xử lý đăng nhập
exports.postLogin = async (req, res) => {
  // Tạm thời để test
  res.send('Xử lý đăng nhập');
};

// Đăng xuất
exports.logout = (req, res) => {
  // Tạm thời để test
  res.redirect('/auth/login');
}; 