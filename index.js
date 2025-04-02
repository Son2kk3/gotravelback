const cors = require("cors");
var session = require("express-session");
const nodemailer = require('nodemailer');
const express = require("express");
const userRouter = require("./router/user");
const authRouter = require("./router/auth");
const adminRoutes = require("./routes/admin"); 
const tourRouter = require("./routes/tourRoutes");
const tourImageRouter = require("./routes/tourImageRoutes");
const pricingRouter = require("./routes/pricingRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const routerDetail = require("./routes/tourDetailRoutes");
const postRouter = require("./routes/posts");
const path = require("path"); 
require("dotenv").config();
const multer = require("multer");
const bodyParser = require("body-parser");
const flash = require('connect-flash');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // 👉 thay bằng email thật
    pass: process.env.EMAIL_PASS,    // 👉 mật khẩu ứng dụng (App Password, không phải mật khẩu Gmail thường)
  },
});

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "dc",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    }
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public"));
const fs = require('fs');
const uploadDir = path.join(__dirname, 'public/uploads/tour-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
app.use("/auth", authRouter);
app.use("/tours", tourRouter);
app.use("/tour-images", tourImageRouter);
// app.use("/pricing", pricingRouter);
app.use("/users", userRouter);
app.use("/tour-details", routerDetail);
app.use("/admin", adminRoutes);
app.use("/bookings", bookingRouter);
app.use("/posts", postRouter);
app.get("/", (req, res) => {
  res.send("Hello");
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



app.post('/api/send-email', async (req, res) => {
  const { email } = req.body;

  try {
    await transporter.sendMail({
      from: '"My App" <son17042003@gmail.com>',
      to: email,
      subject: 'Xin chào!',
      text: 'Cảm ơn bạn đã tin dùng dịch vụ của chúng tôi. Ấn vào đường dẫn này để đặt lại mật khẩu: https://gotravelfront.onrender.com/reset-password',
    });

    res.json({ success: true, message: 'Email đã được gửi!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gửi email thất bại.' });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server is running at http://localhost:${port}`)
);

