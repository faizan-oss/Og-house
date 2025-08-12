const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true },
    mainCategory: { // veg or non-veg
        type: String,
        enum: ['veg', 'non-veg'],
        required: true
    },
    subCategory: { // burger, salad, appetizer, etc.
        type: String,
        enum: [
            'salad', 'appetizers', 'wings',
            'burger', 'sandwich', 'main-course',
            'combos', 'beverage'
        ],
        required: true
    },
    image: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Food", foodSchema);
