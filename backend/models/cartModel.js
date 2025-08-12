const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One cart per user
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Calculate total amount before saving
cartSchema.pre('save', async function(next) {
  if (this.items.length > 0) {
    try {
      const Food = require('./foodModel');
      let total = 0;
      
      for (const item of this.items) {
        const food = await Food.findById(item.food);
        if (food) {
          total += food.price * item.quantity;
        }
      }
      
      this.totalAmount = total;
    } catch (error) {
      console.error('Error calculating cart total:', error);
    }
  } else {
    this.totalAmount = 0;
  }
  next();
});

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtual fields are serialized
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
