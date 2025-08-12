const PaymentService = require('../services/paymentService');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

// Initialize payment for an order
exports.initializePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { currency = 'INR' } = req.body;

    // Get order details
    const order = await Order.findById(orderId)
      .populate('items.food', 'name price image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to pay for this order
    if (req.user.role !== 'admin' && order.userId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Create Razorpay order
    const paymentOrder = await PaymentService.createPaymentOrder(
      orderId,
      order.totalAmount,
      currency
    );

    res.json({
      success: true,
      message: 'Payment initialized successfully',
      paymentOrder,
      order: {
        id: order._id,
        totalAmount: order.totalAmount,
        items: order.items,
        customerName: order.customerName
      }
    });
  } catch (error) {
    console.error('❌ Error initializing payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initialize payment',
      error: error.message 
    });
  }
};

// Verify payment after successful completion
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      orderId 
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing payment verification parameters' 
      });
    }

    // Verify payment signature
    const verification = await PaymentService.verifyPayment(
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    );

    if (!verification.verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Process successful payment
    const result = await PaymentService.processSuccessfulPayment(
      razorpay_payment_id,
      orderId,
      order.totalAmount * 100 // Convert to paise for verification
    );

    res.json({
      success: true,
      message: 'Payment verified and processed successfully',
      order: result.order,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed',
      error: error.message 
    });
  }
};

// Process payment from cart (create order + payment)
exports.processPaymentFromCart = async (req, res) => {
  try {
    const { 
      deliveryAddress, 
      specialInstructions, 
      orderType = 'Delivery',
      phone,
      currency = 'INR'
    } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.food');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create order from cart
    const orderData = {
      customerName: req.user.name,
      userId: req.user.id,
      items: cart.items.map(item => ({
        food: item.food._id,
        quantity: item.quantity,
        price: item.food.price,
        total: item.food.price * item.quantity
      })),
      totalAmount: cart.totalAmount,
      deliveryDetails: {
        address: deliveryAddress || 'Not specified',
        phone: phone || req.user.phone || ''
      },
      specialInstructions: specialInstructions || '',
      orderType: orderType,
      status: 'Pending',
      paymentStatus: 'Pending',
      statusHistory: [{
        status: 'Pending',
        timestamp: new Date(),
        notes: 'Order created from cart, payment pending'
      }]
    };

    const order = new Order(orderData);
    await order.save();

    // Create Razorpay order
    const paymentOrder = await PaymentService.createPaymentOrder(
      order._id,
      order.totalAmount,
      currency
    );

    // Clear the cart after successful order creation
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.json({
      success: true,
      message: 'Order created and payment initialized',
      order: {
        id: order._id,
        totalAmount: order.totalAmount,
        items: order.items,
        customerName: order.customerName
      },
      paymentOrder,
      cartCleared: true
    });
  } catch (error) {
    console.error('❌ Error processing payment from cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process payment from cart',
      error: error.message 
    });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const paymentDetails = await PaymentService.getPaymentDetails(paymentId);

    res.json({
      success: true,
      payment: paymentDetails.payment
    });
  } catch (error) {
    console.error('❌ Error getting payment details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment details',
      error: error.message 
    });
  }
};

// Process refund (Admin only)
exports.processRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order has payment details
    if (!order.paymentDetails?.razorpayPaymentId) {
      return res.status(400).json({ message: 'Order has no payment details' });
    }

    // Check if order is already refunded
    if (order.paymentStatus === 'Refunded') {
      return res.status(400).json({ message: 'Order is already refunded' });
    }

    // Process refund
    const refundAmount = amount || order.totalAmount;
    const result = await PaymentService.processRefund(
      order.paymentDetails.razorpayPaymentId,
      orderId,
      refundAmount,
      reason || 'Admin initiated refund'
    );

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: result.refund,
      order: result.order
    });
  } catch (error) {
    console.error('❌ Error processing refund:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process refund',
      error: error.message 
    });
  }
};

// Get payment status for an order
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .select('paymentStatus paymentDetails totalAmount');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (req.user.role !== 'admin' && order.userId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      paymentDetails: order.paymentDetails || {}
    });
  } catch (error) {
    console.error('❌ Error getting payment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment status',
      error: error.message 
    });
  }
};

// Handle Razorpay webhook
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);

    if (!signature) {
      return res.status(400).json({ message: 'Missing webhook signature' });
    }

    // Process webhook event
    await PaymentService.handleWebhookEvent(req.body, signature, webhookBody);

    res.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Webhook processing failed',
      error: error.message 
    });
  }
};
