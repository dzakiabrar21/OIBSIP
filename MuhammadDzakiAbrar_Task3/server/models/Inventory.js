const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['base', 'sauce', 'cheese', 'veggie', 'meat']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 100
  },
  threshold: {
    type: Number,
    default: 20
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

inventoryItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Auto-disable if stock is 0
  if (this.stock === 0) {
    this.isAvailable = false;
  }
  next();
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
