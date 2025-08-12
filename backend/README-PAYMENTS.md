# 💳 Payment Integration System - The Og House

## 🎯 Overview

Complete payment integration system using Razorpay for secure online payments, order management, and automated webhook processing.

## 🚀 Features

### **Payment Processing**
- ✅ **Razorpay Integration** - Secure payment gateway
- ✅ **Cart to Payment Flow** - Seamless order creation + payment
- ✅ **Payment Verification** - Signature verification for security
- ✅ **Multiple Payment Methods** - Cards, UPI, Net Banking, Wallets
- ✅ **Currency Support** - INR (Indian Rupees)

### **Order Management**
- ✅ **Payment Status Tracking** - Pending, Paid, Failed, Refunded
- ✅ **Payment Details Storage** - Complete transaction history
- ✅ **Order-Payment Linking** - Seamless integration with orders
- ✅ **Real-time Updates** - Live payment status notifications

### **Admin Controls**
- ✅ **Refund Processing** - Full or partial refunds
- ✅ **Payment Analytics** - Transaction monitoring
- ✅ **Webhook Management** - Automated payment updates
- ✅ **Order Status Sync** - Payment-driven order updates

## 🔧 Setup Instructions

### **1. Install Dependencies**
```bash
cd auth-backend
npm install razorpay crypto
```

### **2. Environment Variables**
Add these to your `.env` file:
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Existing variables...
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### **3. Razorpay Dashboard Setup**
1. **Create Account** - Sign up at [razorpay.com](https://razorpay.com)
2. **Get API Keys** - From Dashboard → Settings → API Keys
3. **Configure Webhooks** - Add webhook URL: `https://yourdomain.com/api/payments/webhook`
4. **Webhook Events** - Enable: `payment.captured`, `payment.failed`, `refund.processed`

## 📡 API Endpoints

### **Payment Routes**
```
POST   /api/payments/from-cart          # Create order + payment from cart
POST   /api/payments/initialize/:orderId # Initialize payment for existing order
POST   /api/payments/verify             # Verify payment after completion
GET    /api/payments/status/:orderId    # Get payment status
GET    /api/payments/details/:paymentId # Get payment details
POST   /api/payments/refund/:orderId    # Process refund (Admin only)
POST   /api/payments/webhook            # Razorpay webhook handler
```

### **Request Examples**

#### **Create Order + Payment from Cart**
```javascript
POST /api/payments/from-cart
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "deliveryAddress": "123 Main Street, City",
  "specialInstructions": "Extra cheese please!",
  "orderType": "Delivery",
  "phone": "9999999999",
  "currency": "INR"
}
```

#### **Initialize Payment for Existing Order**
```javascript
POST /api/payments/initialize/:orderId
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "currency": "INR"
}
```

#### **Verify Payment**
```javascript
POST /api/payments/verify
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "razorpay_payment_id": "pay_1234567890",
  "razorpay_order_id": "order_1234567890",
  "razorpay_signature": "generated_signature",
  "orderId": "order_id_from_db"
}
```

#### **Process Refund**
```javascript
POST /api/payments/refund/:orderId
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "amount": 500,
  "reason": "Customer request"
}
```

## 🔄 Payment Flow

### **1. Cart to Payment Flow**
```
User adds items → Cart → Checkout → Order Creation → Payment Initiation → Razorpay → Payment Success → Order Confirmation
```

### **2. Payment Verification Flow**
```
Payment Success → Razorpay → Webhook → Signature Verification → Payment Processing → Order Update → User Notification
```

### **3. Refund Flow**
```
Admin Request → Refund Processing → Razorpay Refund → Webhook → Order Update → User Notification
```

## 🎨 Frontend Integration

### **Razorpay Checkout Integration**
```javascript
// Initialize Razorpay
const options = {
  key: 'YOUR_RAZORPAY_KEY_ID',
  amount: orderAmount * 100, // Convert to paise
  currency: 'INR',
  name: 'The Og House',
  description: `Order #${orderId}`,
  order_id: razorpayOrderId,
  handler: function (response) {
    // Handle successful payment
    verifyPayment(response);
  },
  prefill: {
    name: customerName,
    email: customerEmail,
    contact: customerPhone
  },
  theme: {
    color: '#667eea'
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

### **Payment Status Monitoring**
```javascript
// Check payment status
const checkPaymentStatus = async (orderId) => {
  const response = await fetch(`/api/payments/status/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  return result.paymentStatus;
};
```

## 🔒 Security Features

### **Payment Verification**
- **Signature Verification** - HMAC SHA256 verification
- **Webhook Security** - Secret-based authentication
- **Order Validation** - User authorization checks
- **Amount Validation** - Prevents payment tampering

### **Data Protection**
- **Encrypted Storage** - Sensitive data encryption
- **Audit Trail** - Complete payment history
- **Error Handling** - Secure error responses
- **Input Validation** - Request parameter validation

## 📊 Payment Statuses

### **Order Payment Status**
- **`Pending`** - Payment not yet initiated
- **`Paid`** - Payment successful
- **`Failed`** - Payment failed
- **`Refunded`** - Payment refunded

### **Razorpay Payment Status**
- **`created`** - Payment created
- **`authorized`** - Payment authorized
- **`captured`** - Payment captured
- **`failed`** - Payment failed
- **`refunded`** - Payment refunded

## 🧪 Testing

### **Test Mode Setup**
1. **Use Test Keys** - Razorpay test mode keys
2. **Test Cards** - Use Razorpay test card numbers
3. **Test Webhooks** - Use ngrok for local testing

### **Test Card Numbers**
```
Success: 4111 1111 1111 1111
Failure: 4000 0000 0000 0002
```

### **Test HTML File**
Open `test-payment.html` in your browser to test the complete payment flow.

## 🚨 Error Handling

### **Common Errors**
- **Invalid Signature** - Webhook verification failed
- **Order Not Found** - Invalid order ID
- **Payment Already Processed** - Duplicate payment attempt
- **Insufficient Funds** - Payment method declined

### **Error Response Format**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 📈 Monitoring & Analytics

### **Payment Metrics**
- **Success Rate** - Payment success percentage
- **Transaction Volume** - Daily/monthly totals
- **Refund Rate** - Refund percentage
- **Payment Methods** - Popular payment options

### **Webhook Monitoring**
- **Delivery Status** - Webhook delivery tracking
- **Error Logging** - Failed webhook attempts
- **Retry Logic** - Automatic retry mechanism

## 🔧 Configuration

### **Razorpay Settings**
```javascript
// config/razorpay.js
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
```

### **Webhook Configuration**
```javascript
// Verify webhook signature
const verifyWebhookSignature = (webhookBody, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(webhookBody, 'utf8')
    .digest('hex');
  
  return expectedSignature === signature;
};
```

## 🚀 Deployment

### **Production Checklist**
- [ ] **SSL Certificate** - HTTPS required for webhooks
- [ ] **Webhook URL** - Update Razorpay dashboard
- [ ] **Environment Variables** - Production API keys
- [ ] **Monitoring** - Payment success/failure alerts
- [ ] **Backup** - Payment data backup strategy

### **Webhook URL Examples**
```
Development: http://localhost:5000/api/payments/webhook
Production: https://yourdomain.com/api/payments/webhook
```

## 📚 Additional Resources

- **Razorpay Documentation** - [docs.razorpay.com](https://docs.razorpay.com)
- **Webhook Guide** - [razorpay.com/docs/webhooks](https://razorpay.com/docs/webhooks)
- **Test Mode** - [razorpay.com/docs/payments/test-mode](https://razorpay.com/docs/payments/test-mode)

## 🆘 Support

For payment-related issues:
1. **Check Logs** - Server console for error details
2. **Verify Keys** - Ensure correct API keys in `.env`
3. **Test Webhooks** - Use ngrok for local testing
4. **Razorpay Support** - Contact Razorpay support team

---

**🎉 Your payment system is now ready!** 

Users can securely pay for orders, admins can manage payments and refunds, and the system automatically handles all payment updates through webhooks.
