const Food = require("../models/foodModel");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

exports.addFood = async (req, res) => {
    try {
        const { name, description, price, mainCategory, subCategory, isAvailable } = req.body;

        // Validate required fields
        if (!name || !price || !mainCategory || !subCategory) {
            return res.status(400).json({ 
                message: "Name, price, mainCategory, and subCategory are required fields" 
            });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "food_items"
        });

        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        const food = new Food({
            name,
            description,
            price: parseFloat(price),
            mainCategory,
            subCategory,
            image: result.secure_url,
            isAvailable: isAvailable !== undefined ? isAvailable : true
        });

        await food.save();

        res.status(201).json({ message: "Food item added successfully", food });
    } catch (error) {
        console.error("Error adding food:", error);
        res.status(500).json({ message: "Error adding food", error: error.message });
    }
};

exports.getFoodById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Food ID is required" });
        }

        const food = await Food.findById(id);

        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        res.status(200).json({ message: "Food retrieved successfully", food });
    } catch (error) {
        console.error("Error fetching food by ID:", error);
        res.status(500).json({ message: "Error fetching food", error: error.message });
    }
};


exports.getFoods = async (req, res) => {
    try {
        const foods = await Food.find().sort({ createdAt: -1 });
        res.status(200).json(foods);
    } catch (error) {
        console.error("Error fetching foods:", error);
        res.status(500).json({ message: "Error fetching foods", error: error.message });
    }
};

exports.updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate ID
        if (!id) {
            return res.status(400).json({ message: "Food ID is required" });
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "food_items"
            });
            
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            updates.image = result.secure_url;
        }

        // Convert price to number if provided
        if (updates.price) {
            updates.price = parseFloat(updates.price);
        }

        const food = await Food.findByIdAndUpdate(id, updates, { new: true });

        if (!food) return res.status(404).json({ message: "Food not found" });

        res.status(200).json({ message: "Food updated successfully", food });
    } catch (error) {
        console.error("Error updating food:", error);
        res.status(500).json({ message: "Error updating food", error: error.message });
    }
};

exports.deleteFood = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Food ID is required" });
        }

        const food = await Food.findByIdAndDelete(id);

        if (!food) return res.status(404).json({ message: "Food not found" });

        res.status(200).json({ message: "Food deleted successfully" });
    } catch (error) {
        console.error("Error deleting food:", error);
        res.status(500).json({ message: "Error deleting food", error: error.message });
    }
};
