const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware kiểm tra user đã đăng nhập
exports.isAuthenticated = (req, res, next) => {
  console.log('isAuthenticated middleware');
  // Kiểm tra token trong session
  if (!req.session.token) {
    return res.redirect('/auth/login');
  }
  
  try {
    const decoded = jwt.verify(req.session.token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    req.session.destroy();
    return res.redirect('/auth/login');
  }
};

// Middleware kiểm tra quyền admin
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).render('error', {
      message: 'Bạn không có quyền truy cập trang này',
      error: { status: 403 }
    });
  }
  next();
}; 