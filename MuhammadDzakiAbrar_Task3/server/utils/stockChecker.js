const InventoryItem = require('../models/Inventory');
const { sendLowStockAlert } = require('./email');

/**
 * Check inventory stock levels and send email alerts
 * for items that fall below their threshold value
 */
const checkStockLevels = async () => {
  try {
    const lowStockItems = await InventoryItem.find({
      $expr: { $lte: ['$stock', '$threshold'] }
    });

    if (lowStockItems.length > 0) {
      console.log(`⚠️ ${lowStockItems.length} items below stock threshold`);
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendLowStockAlert(adminEmail, lowStockItems);
      }
    } else {
      console.log('✅ All inventory items are above threshold');
    }
  } catch (error) {
    console.error('❌ Stock check error:', error.message);
  }
};

/**
 * Deduct stock for items used in an order
 * @param {Object} orderItems - The items from the order
 * @returns {Array} - Items that fell below threshold after deduction
 */
const deductStock = async (orderItems) => {
  const lowStockAlerts = [];

  const deductItem = async (itemId) => {
    if (!itemId) return;
    const item = await InventoryItem.findById(itemId);
    if (item) {
      item.stock = Math.max(0, item.stock - 1);
      await item.save();
      if (item.stock <= item.threshold) {
        lowStockAlerts.push(item);
      }
    }
  };

  // Deduct base, sauce, cheese
  if (orderItems.base?.item) await deductItem(orderItems.base.item);
  if (orderItems.sauce?.item) await deductItem(orderItems.sauce.item);
  if (orderItems.cheese?.item) await deductItem(orderItems.cheese.item);

  // Deduct veggies
  if (orderItems.veggies && orderItems.veggies.length > 0) {
    for (const veggie of orderItems.veggies) {
      if (veggie.item) await deductItem(veggie.item);
    }
  }

  // Deduct meat
  if (orderItems.meat && orderItems.meat.length > 0) {
    for (const meat of orderItems.meat) {
      if (meat.item) await deductItem(meat.item);
    }
  }

  // Send alert if any items fell below threshold
  if (lowStockAlerts.length > 0) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendLowStockAlert(adminEmail, lowStockAlerts);
    }
  }

  return lowStockAlerts;
};

module.exports = { checkStockLevels, deductStock };
