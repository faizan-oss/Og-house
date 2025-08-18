const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const { sendOrderPlacedEmail } = require('../services/emailService');
const { notifyAdminNewOrder, notifyUserOrderStatusChange } = require('../services/notificationService');

exports.createOrder = async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();

        // Populate for email details (food names/prices) and send notifications
        try {
            const populated = await Order.findById(order._id).populate('items.food');
            if (populated) {
                // Send email notification to admin
                await sendOrderPlacedEmail(populated);
                console.log('✅ Email notification sent successfully');
                
                // Send real-time notification to admin
                notifyAdminNewOrder(populated);
                console.log('✅ Real-time notification sent successfully');
            }
        } catch (notificationError) {
            console.error('❌ Error sending notifications:', notificationError);
            // Don't fail the order creation if notifications fail
        }

        res.status(201).json(order);
    } catch (err) {
        console.error('❌ Error creating order:', err);
        res.status(500).json({ message: err.message });
    }
};

// Create order from cart
exports.createOrderFromCart = async (req, res) => {
    try {
        const { 
            deliveryAddress, 
            specialInstructions, 
            orderType = 'Delivery',
            phone,
            customerName,
            email,
            address,
            city,
            pincode,
            paymentMethod
        } = req.body;
        
        // Get user's cart
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.food');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Create order from cart items with enhanced details
        const orderData = {
            customerName: customerName || req.user.name,
            userId: req.user.id,
            email: email || req.user.email,
            phone: phone || req.user.phone,
            paymentMethod: paymentMethod || 'cod',
            items: cart.items.map(item => ({
                food: item.food._id,
                quantity: item.quantity,
                price: item.food.price,
                total: item.food.price * item.quantity
            })),
            totalAmount: cart.totalAmount,
            deliveryDetails: {
                address: address || deliveryAddress || 'Not specified',
                city: city || '',
                pincode: pincode || '',
                phone: phone || req.user.phone || ''
            },
            specialInstructions: specialInstructions || '',
            orderType: orderType,
            status: 'Pending',
            statusHistory: [{
                status: 'Pending',
                timestamp: new Date(),
                notes: 'Order created from cart'
            }]
        };

        const order = new Order(orderData);
        await order.save();

        // Clear the cart after successful order
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        // Send notifications
        try {
            console.log('🔔 Sending notifications for order:', order._id);
            const populated = await Order.findById(order._id).populate('items.food');
            if (populated) {
                console.log('📧 Sending email notification...');
                console.log('📋 Populated order data:', {
                    id: populated._id,
                    idType: typeof populated._id,
                    customerName: populated.customerName,
                    items: populated.items?.length || 0
                });
                await sendOrderPlacedEmail(populated);
                console.log('✅ Email notification sent successfully');
                
                console.log('📱 Sending real-time notification...');
                notifyAdminNewOrder(populated);
                console.log('✅ Real-time notification sent successfully');
            } else {
                console.log('⚠️ Could not populate order for notifications');
            }
        } catch (notificationError) {
            console.error('❌ Error sending notifications:', notificationError);
        }

        res.status(201).json({
            message: 'Order created successfully from cart',
            order,
            cartCleared: true
        });
    } catch (err) {
        console.error('❌ Error creating order from cart:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get order tracking details
exports.getOrderTracking = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId)
            .populate('items.food', 'name price image')
            .populate('userId', 'name email phone')
            .populate('statusHistory.updatedBy', 'name');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to view this order
        if (req.user.role !== 'admin' && order.userId?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({
            order,
            tracking: {
                currentStatus: order.status,
                statusHistory: order.statusHistory,
                estimatedDelivery: order.deliveryDetails?.estimatedTime,
                totalDuration: order.totalDuration,
                statusDuration: order.statusDuration
            }
        });
    } catch (err) {
        console.error('❌ Error getting order tracking:', err);
        res.status(500).json({ message: err.message });
    }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const { 
            status, 
            notes, 
            estimatedDeliveryTime,
            deliveryPerson,
            deliveryNotes 
        } = req.body;

        console.log('🔄 Updating order status:', { orderId, status, notes });
        console.log('📋 Request params:', req.params);
        console.log('📋 Request body:', req.body);

        const order = await Order.findById(orderId);
        if (!order) {
            console.log('❌ Order not found:', orderId);
            return res.status(404).json({ message: 'Order not found' });
        }
        console.log('✅ Order found:', order._id, 'Current status:', order.status);

        const oldStatus = order.status;
        
        // Update order fields
        if (status) order.status = status;
        if (notes) order.adminNotes = notes;
        if (estimatedDeliveryTime) order.deliveryDetails.estimatedTime = estimatedDeliveryTime;
        if (deliveryPerson) order.deliveryDetails.deliveryPerson = deliveryPerson;
        if (deliveryNotes) order.deliveryDetails.deliveryNotes = deliveryNotes;

        // Add to status history
        if (status && status !== oldStatus) {
            order.statusHistory.push({
                status: status,
                timestamp: new Date(),
                updatedBy: req.user.id,
                notes: notes || ''
            });
        }

        await order.save();

        // Notify user about status change
        if (status && status !== oldStatus && order.userId) {
            notifyUserOrderStatusChange(order.userId.toString(), order, status);
        }

        res.json({
            message: 'Order status updated successfully',
            order,
            statusChanged: status !== oldStatus
        });
    } catch (err) {
        console.error('❌ Error updating order status:', err);
        res.status(500).json({ message: err.message });
    }
};

// Mark order as delivered
exports.markOrderDelivered = async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const { deliveryNotes } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = 'Delivered';
        order.deliveryDetails.actualDeliveryTime = new Date();
        if (deliveryNotes) order.deliveryDetails.deliveryNotes = deliveryNotes;

        // Add to status history
        order.statusHistory.push({
            status: 'Delivered',
            timestamp: new Date(),
            updatedBy: req.user.id,
            notes: deliveryNotes || 'Order delivered successfully'
        });

        await order.save();

        // Notify user
        if (order.userId) {
            notifyUserOrderStatusChange(order.userId.toString(), order, 'Delivered');
        }

        res.json({
            message: 'Order marked as delivered',
            order
        });
    } catch (err) {
        console.error('❌ Error marking order as delivered:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get orders by status (Admin)
exports.getOrdersByStatus = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('items.food', 'name price image')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        console.error('❌ Error getting orders by status:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get order analytics (Admin)
exports.getOrderAnalytics = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const analytics = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        const totalOrders = await Order.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const totalRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                    status: { $in: ['Completed', 'Delivered'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        res.json({
            today: {
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                byStatus: analytics
            }
        });
    } catch (err) {
        console.error('❌ Error getting order analytics:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('items.food')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Single Order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
        .populate("items.food")
        .populate("userId", 'name email phone')
        .populate('statusHistory.updatedBy', 'name');
    
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Order
exports.updateOrder = async (req, res) => {
    try {
        const oldOrder = await Order.findById(req.params.id);
        if (!oldOrder) return res.status(404).json({ message: 'Order not found' });

        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Check if status changed and notify user
        if (req.body.status && req.body.status !== oldOrder.status) {
            // If order has userId, notify the user about status change
            if (order.userId) {
                notifyUserOrderStatusChange(order.userId.toString(), order, req.body.status);
            }
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
