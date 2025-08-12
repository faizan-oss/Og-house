const mongoose = require('mongoose');

// Status history tracking
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'On The Way', 'Delivered', 'Completed', 'Cancelled'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  notes: {
    type: String,
    default: ''
  }
});

// Delivery details
const deliveryDetailsSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: false
  },
  estimatedTime: {
    type: Date,
    default: null
  },
  actualDeliveryTime: {
    type: Date,
    default: null
  },
  deliveryPerson: {
    type: String,
    default: ''
  },
  deliveryNotes: {
    type: String,
    default: ''
  }
});

// Payment details
const paymentDetailsSchema = new mongoose.Schema({
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  failedAt: {
    type: Date,
    default: null
  },
  errorCode: {
    type: String,
    default: null
  },
  errorDescription: {
    type: String,
    default: null
  },
  refundId: {
    type: String,
    default: null
  },
  refundedAt: {
    type: Date,
    default: null
  },
  refundAmount: {
    type: Number,
    default: null
  },
  refundReason: {
    type: String,
    default: null
  },
  transactionId: {
    type: String,
    default: null
  }
});

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest orders
  },
  items: [
    {
      food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      },
      total: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'On The Way', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  statusHistory: [statusHistorySchema],
  deliveryDetails: deliveryDetailsSchema,
  paymentDetails: paymentDetailsSchema,
  specialInstructions: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    default: ''
  },
  orderType: {
    type: String,
    enum: ['Delivery', 'Pickup'],
    default: 'Delivery'
  },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Urgent'],
    default: 'Normal'
  }
}, { timestamps: true });

// Pre-save middleware to update status history
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      notes: this.adminNotes || ''
    });
  }
  next();
});

// Virtual for current status duration
orderSchema.virtual('statusDuration').get(function() {
  if (this.statusHistory.length > 0) {
    const currentStatus = this.statusHistory[this.statusHistory.length - 1];
    const now = new Date();
    const duration = now - currentStatus.timestamp;
    return Math.floor(duration / (1000 * 60)); // Duration in minutes
  }
  return 0;
});

// Virtual for total order duration
orderSchema.virtual('totalDuration').get(function() {
  if (this.statusHistory.length > 0) {
    const firstStatus = this.statusHistory[0];
    const now = new Date();
    const duration = now - firstStatus.timestamp;
    return Math.floor(duration / (1000 * 60)); // Duration in minutes
  }
  return 0;
});

// Virtual for payment status
orderSchema.virtual('isPaid').get(function() {
  return this.paymentStatus === 'Paid';
});

orderSchema.virtual('isPaymentPending').get(function() {
  return this.paymentStatus === 'Pending';
});

orderSchema.virtual('isPaymentFailed').get(function() {
  return this.paymentStatus === 'Failed';
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
