const express = require("express");
const {
    createOrder,
    createOrderFromCart,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getOrderTracking,
    updateOrderStatus,
    markOrderDelivered,
    getOrdersByStatus,
    getOrderAnalytics
} = require("../controllers/orderController");
const calculateTotalAmount = require("../middleware/calculateTotalAmount");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes (no auth required)
router.post("/", calculateTotalAmount, createOrder);

// Protected routes (auth required)
router.use(protect);

// Create order from cart (requires user auth)
router.post("/from-cart", createOrderFromCart);

// Get user's own orders
router.get("/my-orders", async (req, res) => {
    try {
        const orders = await require("../models/orderModel").find({ userId: req.user.id })
            .populate('items.food')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get order tracking (user can track their own orders, admin can track any)
router.get("/tracking/:orderId", getOrderTracking);

// Admin-only routes
router.use(adminOnly);

// Get all orders with filtering
router.get("/", getAllOrders);

// Get orders by status
router.get("/by-status", getOrdersByStatus);

// Get order analytics
router.get("/analytics", getOrderAnalytics);

// Get single order
router.get("/:id", getOrderById);

// Update order status (enhanced tracking)
router.patch("/:id/status", updateOrderStatus);

// Mark order as delivered
router.patch("/:id/delivered", markOrderDelivered);

// Update order (general updates)
router.patch("/:id", calculateTotalAmount, updateOrder);

// Delete order
router.delete("/:id", deleteOrder);

module.exports = router;
