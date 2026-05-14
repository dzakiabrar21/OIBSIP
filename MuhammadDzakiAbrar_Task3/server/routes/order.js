const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { deductStock } = require('../utils/stockChecker');

const router = express.Router();

// @route   POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalPrice, paymentId, razorpayOrderId } = req.body;
    const order = new Order({
      user: req.user._id, items, totalPrice,
      paymentId: paymentId || '', razorpayOrderId: razorpayOrderId || '',
      isPaid: !!paymentId, status: 'Order Received',
      statusHistory: [{ status: 'Order Received', timestamp: new Date() }]
    });
    await order.save();
    await deductStock(items);
    const io = req.app.get('io');
    if (io) { io.emit('newOrder', { orderId: order._id, status: order.status, user: req.user.name }); }
    res.status(201).json(order);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// @route   GET /api/orders/my-orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// @route   GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

module.exports = router;
