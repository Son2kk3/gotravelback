const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./userRoutes');
const tourRoutes = require('./tourRoutes');
const tourDetailRoutes = require('./tourDetailRoutes');
const tourImageRoutes = require('./tourImageRoutes');
const bookingRoutes = require('./bookingRoutes');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');

// Set up base routes
router.use('/users', userRoutes);
router.use('/tours', tourRoutes);
router.use('/tour-details', tourDetailRoutes);
router.use('/tour-images', tourImageRoutes);
router.use('/api/bookings', bookingRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

// Home route
router.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// Add routes for other controllers as they are created
// router.use('/tour-schedules', tourScheduleRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/tour-categories', tourCategoryRoutes);
// router.use('/pricing', pricingRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/reviews', reviewRoutes);
// router.use('/blog-posts', blogPostRoutes);

module.exports = router;
