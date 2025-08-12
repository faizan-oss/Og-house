const Food = require('../models/foodModel');

const calculateTotalAmount = async (req, res, next) => {
    try {
        const items = req.body.items;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Items are required' });
        }

        let total = 0;
        for (const item of items) {
            const food = await Food.findById(item.food);
            if (!food) {
                return res.status(404).json({ message: `Food item not found: ${item.food}` });
            }
            total += food.price * item.quantity;
        }

        req.body.totalAmount = total; // ✅ inject into request
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = calculateTotalAmount;
