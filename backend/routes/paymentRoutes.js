const express = require('express');
const {
  initializePayment,
  verifyPayment,
  processPaymentFromCart,
  getPaymentDetails,
  processRefund,
  getPaymentStatus,
  handleWebhook
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Webhook endpoint (no auth required - Razorpay calls this)
router.post('/webhook', handleWebhook);

// Protected routes (auth required)
router.use(protect);

// Initialize payment for existing order
router.post('/initialize/:orderId', initializePayment);

// Verify payment after completion
router.post('/verify', verifyPayment);

// Process payment directly from cart (create order + payment)
router.post('/from-cart', processPaymentFromCart);

// Get payment details
router.get('/details/:paymentId', getPaymentDetails);

// Get payment status for an order
router.get('/status/:orderId', getPaymentStatus);

// Admin-only routes
router.use(adminOnly);

// Process refund
router.post('/refund/:orderId', processRefund);

module.exports = router;
