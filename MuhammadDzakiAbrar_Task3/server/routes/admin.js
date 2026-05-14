const express = require('express');
const InventoryItem = require('../models/Inventory');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendOrderStatusEmail } = require('../utils/email');
const router = express.Router();

// ============ INVENTORY MANAGEMENT ============

// @route GET /api/admin/inventory
router.get('/inventory', protect, adminOnly, async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items = await InventoryItem.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// @route POST /api/admin/inventory
router.post('/inventory', protect, adminOnly, async (req, res) => {
  try {
    const { name, category, price, stock, threshold, description } = req.body;
    const item = new InventoryItem({ name, category, price, stock, threshold, description });
    await item.save();
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// @route PUT /api/admin/inventory/:id
router.put('/inventory/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// @route DELETE /api/admin/inventory/:id
router.delete('/inventory/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// ============ ORDER MANAGEMENT ============

// @route GET /api/admin/orders
router.get('/orders', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// @route PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date() });
    await order.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('orderStatusUpdate', { orderId: order._id, status, userId: order.user._id });
    }

    // Send email notification to user
    try {
      await sendOrderStatusEmail(order.user.email, order._id, status);
    } catch (e) { console.log('Status email failed:', e.message); }

    res.json(order);
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// ============ DASHBOARD STATS ============

// @route GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $in: ['Order Received', 'In the Kitchen'] } });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const lowStockItems = await InventoryItem.find({ $expr: { $lte: ['$stock', '$threshold'] } });
    const revenueResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const recentOrders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10);

    res.json({
      totalOrders, pendingOrders, deliveredOrders, totalUsers,
      lowStockCount: lowStockItems.length, lowStockItems,
      totalRevenue, recentOrders
    });
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

// @route POST /api/admin/seed-inventory
router.post('/seed-inventory', protect, adminOnly, async (req, res) => {
  try {
    const existing = await InventoryItem.countDocuments();
    if (existing > 0) return res.status(400).json({ message: 'Inventory already seeded' });

    const seedData = [
      // Bases
      { name: 'Thin Crust', category: 'base', price: 3.00, stock: 100, threshold: 20, description: 'Classic thin and crispy crust' },
      { name: 'Thick Crust', category: 'base', price: 3.50, stock: 100, threshold: 20, description: 'Thick and fluffy dough' },
      { name: 'Stuffed Crust', category: 'base', price: 4.50, stock: 80, threshold: 20, description: 'Cheese-filled crust edges' },
      { name: 'Gluten-Free', category: 'base', price: 5.00, stock: 60, threshold: 15, description: 'Made with gluten-free flour' },
      { name: 'Whole Wheat', category: 'base', price: 4.00, stock: 80, threshold: 20, description: 'Healthy whole wheat option' },
      // Sauces
      { name: 'Classic Tomato', category: 'sauce', price: 1.00, stock: 150, threshold: 30, description: 'Traditional marinara sauce' },
      { name: 'BBQ Sauce', category: 'sauce', price: 1.50, stock: 120, threshold: 25, description: 'Smoky barbecue sauce' },
      { name: 'White Garlic', category: 'sauce', price: 1.50, stock: 100, threshold: 20, description: 'Creamy garlic alfredo' },
      { name: 'Pesto', category: 'sauce', price: 2.00, stock: 80, threshold: 20, description: 'Fresh basil pesto' },
      { name: 'Hot Sauce', category: 'sauce', price: 1.50, stock: 90, threshold: 20, description: 'Spicy chili sauce' },
      // Cheeses
      { name: 'Mozzarella', category: 'cheese', price: 2.00, stock: 200, threshold: 40, description: 'Classic stretchy mozzarella' },
      { name: 'Cheddar', category: 'cheese', price: 2.50, stock: 150, threshold: 30, description: 'Sharp aged cheddar' },
      { name: 'Parmesan', category: 'cheese', price: 3.00, stock: 100, threshold: 20, description: 'Aged Italian parmesan' },
      { name: 'Gouda', category: 'cheese', price: 3.00, stock: 80, threshold: 20, description: 'Smoky Dutch gouda' },
      { name: 'Vegan Cheese', category: 'cheese', price: 3.50, stock: 60, threshold: 15, description: 'Plant-based cheese alternative' },
      // Veggies
      { name: 'Mushrooms', category: 'veggie', price: 1.00, stock: 120, threshold: 25, description: 'Fresh sliced mushrooms' },
      { name: 'Bell Peppers', category: 'veggie', price: 0.75, stock: 130, threshold: 25, description: 'Colorful bell pepper strips' },
      { name: 'Onions', category: 'veggie', price: 0.50, stock: 150, threshold: 30, description: 'Sliced red onions' },
      { name: 'Olives', category: 'veggie', price: 1.00, stock: 100, threshold: 20, description: 'Black and green olives' },
      { name: 'Tomatoes', category: 'veggie', price: 0.75, stock: 120, threshold: 25, description: 'Fresh sliced tomatoes' },
      { name: 'Spinach', category: 'veggie', price: 1.00, stock: 90, threshold: 20, description: 'Fresh baby spinach' },
      { name: 'Jalapeños', category: 'veggie', price: 0.75, stock: 100, threshold: 20, description: 'Spicy sliced jalapeños' },
      { name: 'Corn', category: 'veggie', price: 0.75, stock: 110, threshold: 20, description: 'Sweet corn kernels' },
      // Meats
      { name: 'Pepperoni', category: 'meat', price: 2.00, stock: 150, threshold: 30, description: 'Classic pepperoni slices' },
      { name: 'Chicken', category: 'meat', price: 2.50, stock: 120, threshold: 25, description: 'Grilled chicken pieces' },
      { name: 'Sausage', category: 'meat', price: 2.00, stock: 100, threshold: 20, description: 'Italian sausage crumbles' },
      { name: 'Bacon', category: 'meat', price: 2.50, stock: 90, threshold: 20, description: 'Crispy bacon bits' },
      { name: 'Ham', category: 'meat', price: 2.00, stock: 100, threshold: 20, description: 'Sliced smoked ham' },
    ];

    await InventoryItem.insertMany(seedData);
    res.status(201).json({ message: 'Inventory seeded successfully', count: seedData.length });
  } catch (error) { res.status(500).json({ message: 'Server error', error: error.message }); }
});

module.exports = router;
