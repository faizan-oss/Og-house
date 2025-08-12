const Food = require('../models/foodModel');

// Validate cart item data
exports.validateCartItem = async (req, res, next) => {
  try {
    const { foodId, quantity } = req.body;

    // Check required fields
    if (!foodId || !quantity) {
      return res.status(400).json({
        message: 'Food ID and quantity are required'
      });
    }

    // Validate quantity
    if (quantity < 1 || !Number.isInteger(Number(quantity))) {
      return res.status(400).json({
        message: 'Quantity must be a positive integer'
      });
    }

    // Check if food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        message: 'Food item not found'
      });
    }

    // Check if food is available
    if (!food.isAvailable) {
      return res.status(400).json({
        message: 'This food item is currently unavailable'
      });
    }

    // Add food data to request for later use
    req.food = food;
    next();
  } catch (error) {
    console.error('Cart validation error:', error);
    res.status(500).json({
      message: 'Error validating cart item'
    });
  }
};

// Validate cart operations
exports.validateCartOperation = async (req, res, next) => {
  try {
    const { foodId } = req.params;

    if (!foodId) {
      return res.status(400).json({
        message: 'Food ID is required'
      });
    }

    // Check if food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        message: 'Food item not found'
      });
    }

    req.food = food;
    next();
  } catch (error) {
    console.error('Cart operation validation error:', error);
    res.status(500).json({
      message: 'Error validating cart operation'
    });
  }
};

// Check cart limits
exports.checkCartLimits = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    
    // Maximum items per cart
    const MAX_ITEMS = 50;
    const MAX_QUANTITY_PER_ITEM = 20;

    if (quantity > MAX_QUANTITY_PER_ITEM) {
      return res.status(400).json({
        message: `Maximum quantity per item is ${MAX_QUANTITY_PER_ITEM}`
      });
    }

    // Get current cart
    const Cart = require('../models/cartModel');
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (cart) {
      const currentItemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
      
      if (currentItemCount + quantity > MAX_ITEMS) {
        return res.status(400).json({
          message: `Cart cannot exceed ${MAX_ITEMS} total items`
        });
      }
    }

    next();
  } catch (error) {
    console.error('Cart limits check error:', error);
    res.status(500).json({
      message: 'Error checking cart limits'
    });
  }
};
