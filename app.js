const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require('./routes');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

// Set up EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Cấu hình session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Cấu hình flash
app.use(flash());

// Middleware để làm cho flash messages khả dụng trong templates
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success');
  res.locals.error_messages = req.flash('error');
  // Truyền thông tin user vào tất cả các views
  res.locals.user = req.session.user;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Home route
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// Thêm route này vào trước middleware xử lý lỗi
app.get('/test', (req, res) => {
  res.send('Server đang hoạt động!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send(`
    <h1>Đã xảy ra lỗi</h1>
    <p>${err.message}</p>
    <pre>${err.stack}</pre>
    <a href="javascript:history.back()">Quay lại</a>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
