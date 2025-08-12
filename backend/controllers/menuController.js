const Menu = require('../models/menuModel');

// Create menu item
exports.createMenuItem = async (req, res) => {
    try {
        const menuItem = new Menu(req.body);
        const savedItem = await menuItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all menu items
exports.getMenuItems = async (req, res) => {
    try {
        const items = await Menu.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single menu item by ID
exports.getMenuItemById = async (req, res) => {
    try {
        const item = await Menu.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Menu item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
    try {
        const updatedItem = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Menu item not found' });
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
    try {
        const deletedItem = await Menu.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Menu item not found' });
        res.json({ message: 'Menu item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
