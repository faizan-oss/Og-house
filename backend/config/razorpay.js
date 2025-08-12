const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Verify webhook signature
const verifyWebhookSignature = (webhookBody, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(webhookBody, 'utf8')
    .digest('hex');
  
  return expectedSignature === signature;
};

// Generate order ID for Razorpay
const generateRazorpayOrderId = (orderId, amount) => {
  return `order_${orderId}_${Date.now()}`;
};

// Format amount for Razorpay (convert to smallest currency unit - paise for INR)
const formatAmount = (amount) => {
  return Math.round(amount * 100); // Convert to paise
};

// Parse amount from Razorpay (convert from paise to rupees)
const parseAmount = (amount) => {
  return amount / 100; // Convert from paise to rupees
};

module.exports = {
  razorpay,
  verifyWebhookSignature,
  generateRazorpayOrderId,
  formatAmount,
  parseAmount
};
