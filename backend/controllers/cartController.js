const Cart = require('../models/cartModel');
const Food = require('../models/foodModel');

// Get current user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.food', 'name price image mainCategory subCategory')
      .populate('user', 'name email');

    if (!cart) {
      // Create empty cart if doesn't exist
      const newCart = new Cart({ user: req.user.id, items: [] });
      await newCart.save();
      return res.json(newCart);
    }

    res.json(cart);
  } catch (err) {
    console.error('Error getting cart:', err);
    res.status(500).json({ message: 'Error retrieving cart' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    // Validate input
    if (!foodId || !quantity || quantity < 1) {
      return res.status(400).json({ 
        message: 'Food ID and quantity (min 1) are required' 
      });
    }

    // Check if food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: req.user.id,
        items: [{ food: foodId, quantity }]
      });
    } else {
      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.food.toString() === foodId
      );

      if (existingItemIndex > -1) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ food: foodId, quantity });
      }
    }

    await cart.save();
    
    // Populate food details for response
    await cart.populate('items.food', 'name price image mainCategory subCategory');
    
    res.status(201).json({
      message: 'Item added to cart successfully',
      cart
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Error adding item to cart' });
  }
};

// Update item quantity in cart
exports.updateCartItem = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        message: 'Quantity must be at least 1' 
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.food.toString() === foodId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    // Populate food details for response
    await cart.populate('items.food', 'name price image mainCategory subCategory');
    
    res.json({
      message: 'Cart item updated successfully',
      cart
    });
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).json({ message: 'Error updating cart item' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { foodId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.food.toString() === foodId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    // Populate food details for response
    await cart.populate('items.food', 'name price image mainCategory subCategory');
    
    res.json({
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({
      message: 'Cart cleared successfully',
      cart
    });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Error clearing cart' });
  }
};

// Get cart summary (item count, total amount)
exports.getCartSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.json({
        itemCount: 0,
        totalAmount: 0,
        items: []
      });
    }

    res.json({
      itemCount: cart.itemCount,
      totalAmount: cart.totalAmount,
      items: cart.items
    });
  } catch (err) {
    console.error('Error getting cart summary:', err);
    res.status(500).json({ message: 'Error retrieving cart summary' });
  }
};
