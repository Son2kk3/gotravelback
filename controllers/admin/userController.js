const { User, Booking } = require('../../models');

// Hiển thị danh sách người dùng
exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.render('admin/users/index', { 
      users, 
      page, 
      limit, 
      totalPages, 
      admin: req.user  // Pass the admin user info
    });
  } catch (error) {
    console.error('Error loading users:', error);
    res.status(500).send('Server Error');
  }
}; 