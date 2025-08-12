const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// GET /cart - Get current user's cart
router.get('/', getCart);

// GET /cart/summary - Get cart summary (item count, total)
router.get('/summary', getCartSummary);

// POST /cart - Add item to cart
router.post('/', addToCart);

// PUT /cart/:foodId - Update item quantity
router.put('/:foodId', updateCartItem);

// DELETE /cart/:foodId - Remove specific item
router.delete('/:foodId', removeFromCart);

// DELETE /cart - Clear entire cart
router.delete('/', clearCart);

module.exports = router;
