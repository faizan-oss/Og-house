const Order = require('../models/orderModel');
const { notifyUserOrderStatusChange } = require('./notificationService');

class OrderTrackingService {
  // Update order status with detailed tracking
  static async updateOrderStatus(orderId, newStatus, adminId, notes = '') {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const oldStatus = order.status;
      
      // Update status
      order.status = newStatus;
      
      // Add to status history
      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        updatedBy: adminId,
        notes: notes
      });

      // Update admin notes if provided
      if (notes) {
        order.adminNotes = notes;
      }

      await order.save();

      // Notify user about status change
      if (order.userId && newStatus !== oldStatus) {
        await notifyUserOrderStatusChange(order.userId.toString(), order, newStatus);
      }

      return {
        success: true,
        order,
        statusChanged: newStatus !== oldStatus,
        message: `Order status updated to ${newStatus}`
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Get comprehensive order tracking
  static async getOrderTracking(orderId, userId, userRole) {
    try {
      const order = await Order.findById(orderId)
        .populate('items.food', 'name price image')
        .populate('userId', 'name email phone')
        .populate('statusHistory.updatedBy', 'name');

      if (!order) {
        throw new Error('Order not found');
      }

      // Check authorization
      if (userRole !== 'admin' && order.userId?.toString() !== userId) {
        throw new Error('Access denied');
      }

      // Calculate tracking metrics
      const tracking = this.calculateTrackingMetrics(order);

      return {
        order,
        tracking
      };
    } catch (error) {
      console.error('Error getting order tracking:', error);
      throw error;
    }
  }

  // Calculate tracking metrics
  static calculateTrackingMetrics(order) {
    const now = new Date();
    const firstStatus = order.statusHistory[0];
    const currentStatus = order.statusHistory[order.statusHistory.length - 1];

    const totalDuration = firstStatus ? 
      Math.floor((now - firstStatus.timestamp) / (1000 * 60)) : 0;

    const statusDuration = currentStatus ? 
      Math.floor((now - currentStatus.timestamp) / (1000 * 60)) : 0;

    // Calculate estimated delivery time
    let estimatedDelivery = null;
    if (order.deliveryDetails?.estimatedTime) {
      estimatedDelivery = order.deliveryDetails.estimatedTime;
    } else if (order.status === 'Accepted') {
      // Default: 30 minutes from acceptance
      estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000);
    }

    // Calculate progress percentage
    const statusOrder = [
      'Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 
      'On The Way', 'Delivered', 'Completed'
    ];
    const currentIndex = statusOrder.indexOf(order.status);
    const progressPercentage = currentIndex >= 0 ? 
      Math.round((currentIndex / (statusOrder.length - 1)) * 100) : 0;

    return {
      currentStatus: order.status,
      statusHistory: order.statusHistory,
      estimatedDelivery,
      totalDuration,
      statusDuration,
      progressPercentage,
      isDelivered: ['Delivered', 'Completed'].includes(order.status),
      isCancelled: order.status === 'Cancelled'
    };
  }

  // Get orders by status for admin dashboard
  static async getOrdersByStatus(status = 'all') {
    try {
      let query = {};
      if (status && status !== 'all') {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate('items.food', 'name price image')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      console.error('Error getting orders by status:', error);
      throw error;
    }
  }

  // Get order analytics
  static async getOrderAnalytics() {
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

      return {
        today: {
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          byStatus: analytics
        }
      };
    } catch (error) {
      console.error('Error getting order analytics:', error);
      throw error;
    }
  }

  // Mark order as delivered
  static async markOrderDelivered(orderId, adminId, deliveryNotes = '') {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      order.status = 'Delivered';
      order.deliveryDetails.actualDeliveryTime = new Date();
      if (deliveryNotes) {
        order.deliveryDetails.deliveryNotes = deliveryNotes;
      }

      // Add to status history
      order.statusHistory.push({
        status: 'Delivered',
        timestamp: new Date(),
        updatedBy: adminId,
        notes: deliveryNotes || 'Order delivered successfully'
      });

      await order.save();

      // Notify user
      if (order.userId) {
        await notifyUserOrderStatusChange(order.userId.toString(), order, 'Delivered');
      }

      return {
        success: true,
        order,
        message: 'Order marked as delivered'
      };
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      throw error;
    }
  }
}

module.exports = OrderTrackingService;
