const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    base: {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
      name: String,
      price: Number
    },
    sauce: {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
      name: String,
      price: Number
    },
    cheese: {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
      name: String,
      price: Number
    },
    veggies: [{
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
      name: String,
      price: Number
    }],
    meat: [{
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
      name: String,
      price: Number
    }]
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'],
    default: 'Order Received'
  },
  paymentId: {
    type: String,
    default: ''
  },
  razorpayOrderId: {
    type: String,
    default: ''
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
