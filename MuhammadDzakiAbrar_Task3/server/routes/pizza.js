const express = require('express');
const InventoryItem = require('../models/Inventory');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/pizza/menu
// @desc    Get all available pizza ingredients (grouped by category)
router.get('/menu', protect, async (req, res) => {
  try {
    const items = await InventoryItem.find({ isAvailable: true, stock: { $gt: 0 } });

    const menu = {
      bases: items.filter(item => item.category === 'base'),
      sauces: items.filter(item => item.category === 'sauce'),
      cheeses: items.filter(item => item.category === 'cheese'),
      veggies: items.filter(item => item.category === 'veggie'),
      meats: items.filter(item => item.category === 'meat')
    };

    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/pizza/featured
// @desc    Get featured pizza combinations (pre-made options)
router.get('/featured', protect, async (req, res) => {
  try {
    // Return pre-defined pizza combinations
    const featured = [
      {
        id: 'margherita',
        name: 'Classic Margherita',
        description: 'Traditional Italian pizza with fresh mozzarella, tomato sauce, and basil',
        price: 12.99,
        image: 'margherita',
        tags: ['Vegetarian', 'Classic']
      },
      {
        id: 'pepperoni',
        name: 'Pepperoni Supreme',
        description: 'Loaded with premium pepperoni, mozzarella, and our signature tomato sauce',
        price: 14.99,
        image: 'pepperoni',
        tags: ['Best Seller', 'Meat']
      },
      {
        id: 'veggie',
        name: 'Garden Veggie',
        description: 'Fresh bell peppers, mushrooms, olives, onions, and tomatoes',
        price: 13.99,
        image: 'veggie',
        tags: ['Vegetarian', 'Healthy']
      },
      {
        id: 'bbq-chicken',
        name: 'BBQ Chicken',
        description: 'Grilled chicken, BBQ sauce, red onions, and cilantro',
        price: 15.99,
        image: 'bbq-chicken',
        tags: ['Popular', 'Meat']
      },
      {
        id: 'hawaiian',
        name: 'Hawaiian Paradise',
        description: 'Ham, pineapple, mozzarella with our classic tomato sauce',
        price: 14.49,
        image: 'hawaiian',
        tags: ['Sweet', 'Meat']
      },
      {
        id: 'meat-lovers',
        name: 'Meat Lovers',
        description: 'Pepperoni, sausage, bacon, ham, and ground beef',
        price: 16.99,
        image: 'meat-lovers',
        tags: ['Premium', 'Meat']
      }
    ];

    res.json(featured);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
