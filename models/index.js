require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.URL_MONGODB;
mongoose.connect(url);

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullname: { type: String },
  phone: { type: String },
  avatar: { type: String },
  address: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Tour Schema
const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  original_price: { type: Number },
  discount: { type: Number },
  duration: { type: String },
  schedule: { type: String },
  region: { type: String, enum: ['north', 'central', 'south', 'international'] },
  continent: { type: String },
  country: { type: String },
  vehicle: { type: String },
  rating: { type: Number },
  reviews_count: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  thumbnail: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// Tour Details Schema
const tourDetailSchema = new mongoose.Schema({
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'tours', required: true },
  highlights: { type: String },
  included: { type: String },
  excluded: { type: String },
  policy: { type: String }
}, { timestamps: true });

// Tour Images Schema
const tourImageSchema = new mongoose.Schema({
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'tours', required: true },
  image_url: { type: String, required: true },
  display_order: { type: Number }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Tour Schedules Schema
const tourScheduleSchema = new mongoose.Schema({
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'tours', required: true },
  day: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String }
}, { timestamps: true });

// Categories Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' }
}, { timestamps: true });

// Tour Categories Schema (for n:m relationship)
const tourCategorySchema = new mongoose.Schema({
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'tours', required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true }
});

// Pricing Schema
const pricingSchema = new mongoose.Schema({
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'tours', required: true },
  type: { type: String, enum: ['adult', 'child', 'infant'], required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

// Bookings Schema
const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'tours', required: true },
  booking_date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  total_price: { type: Number, required: true },
  adult_count: { type: Number, default: 0 },
  child_count: { type: Number, default: 0 },
  infant_count: { type: Number, default: 0 },
  contact_name: { type: String, required: true },
  contact_email: { type: String, required: true },
  contact_phone: { type: String },
  special_request: { type: String },
  payment_method: { type: String },
  payment_status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' }
}, { timestamps: true });

// Reviews Schema
const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  tour_id: { type: mongoose.Schema.Types.ObjectId, ref: 'tours', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  content: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

// Blog Posts Schema
const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  excerpt: { type: String },
  content: { type: String },
  thumbnail: { type: String },
  author: { type: String },
  // author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  view_count: { type: Number, default: 0 }
}, { timestamps: true });

const blackListSchema = new mongoose.Schema({
  token: String,
  expired: Date,
});
const Blacklist = mongoose.model("blackList", blackListSchema);

// Create models
const User = mongoose.model("users", userSchema);
const Tour = mongoose.model("tours", tourSchema);
const TourDetail = mongoose.model("tour_details", tourDetailSchema);
const TourImage = mongoose.model("tour_images", tourImageSchema);
const TourSchedule = mongoose.model("tour_schedules", tourScheduleSchema);
const Category = mongoose.model("categories", categorySchema);
const TourCategory = mongoose.model("tour_categories", tourCategorySchema);
const Pricing = mongoose.model("pricing", pricingSchema);
const Booking = mongoose.model("bookings", bookingSchema);
const Review = mongoose.model("reviews", reviewSchema);
const BlogPost = mongoose.model("blog_posts", blogPostSchema);

// Add compound index for tour_categories (since it has a composite primary key)
TourCategory.schema.index({ tour_id: 1, category_id: 1 }, { unique: true });

module.exports = { 
  User, 
  Tour, 
  TourDetail, 
  TourImage, 
  TourSchedule, 
  Category, 
  TourCategory, 
  Pricing, 
  Booking, 
  Review, 
  BlogPost,
  Blacklist
};
