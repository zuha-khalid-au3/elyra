const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: {
    image: { type: String, required: true },
    name: { type: String, required: true }
  },
  reviewDate: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  content: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  oldPrice: { type: String, required: true },
  price: { type: String, required: true },
  isSale: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  image: { type: String, required: true },
  category: { type: String, required: true },
  filterItems: [{ type: String }],
  isStocked: { type: Boolean, default: true },
  productNumber: { type: String, required: true, unique: true },
  imageGallery: [{ type: String }],
  colors: [{ type: String }],
  content: { type: String, required: true },
  description: { type: String, required: true },
  reviews: [reviewSchema]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
