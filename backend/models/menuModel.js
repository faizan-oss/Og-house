const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Food name is required'],
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'veg', 'non-veg',
            'salad', 'appetizers', 'wings',
            'burger', 'sandwich', 'main-course',
            'combos', 'beverage'
        ]
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String, // store URL or image path
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
