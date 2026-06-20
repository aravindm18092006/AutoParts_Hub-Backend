const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Part name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  imgName: {
    type: String,
    required: [true, 'Image name is required'],
    default: 'download.png'
  },
  inStock: {
    type: Number,
    required: [true, 'Stock count is required'],
    default: 1
  },
  defaultPrice: {
    type: Number,
    required: [true, 'Price is required']
  },
  rating: {
    type: String,
    default: '4.5'
  },
  ratingCount: {
    type: String,
    default: '10 ratings'
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Part', partSchema);
