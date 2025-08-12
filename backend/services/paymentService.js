const { 
  razorpay, 
  verifyWebhookSignature, 
  generateRazorpayOrderId, 
  formatAmount, 
  parseAmount 
} = require('../config/razorpay');
const Order = require('../models/orderModel');
const { notifyUserOrderStatusChange } = require('./notificationService');

class PaymentService {
  // Create Razorpay order
  static async createPaymentOrder(orderId, amount, currency = 'INR') {
    try {
      const razorpayOrderId = generateRazorpayOrderId(orderId, amount);
      const formattedAmount = formatAmount(amount);

      const options = {
        amount: formattedAmount,
        currency: currency,
        receipt: razorpayOrderId,
        notes: {
          orderId: orderId,

          description: `Payment for Order #${orderId}`
        }
      };

      const razorpayOrder = await razorpay.orders.create(options);

      return {
        success: true,
        razorpayOrderId: razorpayOrder.id,
        amount: formattedAmount,
        currency: currency,
        receipt: razorpayOrder.receipt
      };
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  // Verify payment signature
  static async verifyPayment(paymentId, orderId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text, 'utf8')
        .digest('hex');

      if (expectedSignature === signature) {
        return { success: true, verified: true };
      } else {
        return { success: false, verified: false, message: 'Invalid signature' };
      }
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      throw new Error('Payment verification failed');
    }
  }

  // Process successful payment
  static async processSuccessfulPayment(paymentId, orderId, amount) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Update order payment status
      order.paymentStatus = 'Paid';
      order.paymentMethod = 'Razorpay';
      
      // Add payment details to order
      if (!order.paymentDetails) {
        order.paymentDetails = {};
      }
      order.paymentDetails.razorpayPaymentId = paymentId;
      order.paymentDetails.paidAt = new Date();
      order.paymentDetails.amount = parseAmount(amount);

      await order.save();

      // Notify user about successful payment
      if (order.userId) {
        await notifyUserOrderStatusChange(order.userId.toString(), order, 'Payment Successful');
      }

      return {
        success: true,
        order,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      console.error('❌ Error processing successful payment:', error);
      throw error;
    }
  }

  // Process failed payment
  static async processFailedPayment(paymentId, orderId, errorCode, errorDescription) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Update order payment status
      order.paymentStatus = 'Failed';
      
      // Add failure details to order
      if (!order.paymentDetails) {
        order.paymentDetails = {};
      }
      order.paymentDetails.razorpayPaymentId = paymentId;
      order.paymentDetails.failedAt = new Date();
      order.paymentDetails.errorCode = errorCode;
      order.paymentDetails.errorDescription = errorDescription;

      await order.save();

      // Notify user about failed payment
      if (order.userId) {
        await notifyUserOrderStatusChange(order.userId.toString(), order, 'Payment Failed');
      }

      return {
        success: true,
        order,
        message: 'Payment failure recorded'
      };
    } catch (error) {
      console.error('❌ Error processing failed payment:', error);
      throw error;
    }
  }

  // Process refund
  static async processRefund(paymentId, orderId, amount, reason = 'Customer request') {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Create refund in Razorpay
      const refundOptions = {
        payment_id: paymentId,
        amount: formatAmount(amount),
        notes: {
          reason: reason,
          orderId: orderId
        }
      };

      const refund = await razorpay.payments.refund(refundOptions);

      // Update order payment status
      order.paymentStatus = 'Refunded';
      
      // Add refund details to order
      if (!order.paymentDetails) {
        order.paymentDetails = {};
      }
      order.paymentDetails.refundId = refund.id;
      order.paymentDetails.refundedAt = new Date();
      order.paymentDetails.refundAmount = amount;
      order.paymentDetails.refundReason = reason;

      await order.save();

      // Notify user about refund
      if (order.userId) {
        await notifyUserOrderStatusChange(order.userId.toString(), order, 'Payment Refunded');
      }

      return {
        success: true,
        refund,
        order,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      console.error('❌ Error processing refund:', error);
      throw error;
    }
  }

  // Get payment details
  static async getPaymentDetails(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return {
        success: true,
        payment: {
          id: payment.id,
          amount: parseAmount(payment.amount),
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          description: payment.description,
          email: payment.email,
          contact: payment.contact,
          createdAt: payment.created_at
        }
      };
    } catch (error) {
      console.error('❌ Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  // Handle webhook events
  static async handleWebhookEvent(event, signature, webhookBody) {
    try {
      // Verify webhook signature
      if (!verifyWebhookSignature(webhookBody, signature)) {
        throw new Error('Invalid webhook signature');
      }

      const eventType = event.event;
      const payload = event.payload;

      switch (eventType) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payload);
          break;
        
        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;
        
        case 'refund.processed':
          await this.handleRefundProcessed(payload);
          break;
        
        default:
          console.log(`📧 Unhandled webhook event: ${eventType}`);
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      throw error;
    }
  }

  // Handle payment captured event
  static async handlePaymentCaptured(payload) {
    const payment = payload.payment.entity;
    const orderId = payment.notes?.orderId;
    
    if (orderId) {
      await this.processSuccessfulPayment(
        payment.id,
        orderId,
        payment.amount
      );
    }
  }

  // Handle payment failed event
  static async handlePaymentFailed(payload) {
    const payment = payload.payment.entity;
    const orderId = payment.notes?.orderId;
    
    if (orderId) {
      await this.processFailedPayment(
        payment.id,
        orderId,
        payment.error_code,
        payment.error_description
      );
    }
  }

  // Handle refund processed event
  static async handleRefundProcessed(payload) {
    const refund = payload.refund.entity;
    const orderId = refund.notes?.orderId;
    
    if (orderId) {
      // Update order with refund details
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'Refunded';
        if (!order.paymentDetails) order.paymentDetails = {};
        order.paymentDetails.refundId = refund.id;
        order.paymentDetails.refundedAt = new Date();
        order.paymentDetails.refundAmount = parseAmount(refund.amount);
        await order.save();
      }
    }
  }
}

module.exports = PaymentService;