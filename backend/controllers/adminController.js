const Order = require('../models/orderModel');
const User = require('../models/User');
const Food = require('../models/foodModel');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Total orders count
    const totalOrders = await Order.countDocuments();
    const newOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Total revenue
    const totalRevenueResult = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const currentMonthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth, $lte: endOfLastMonth },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Active users (users who made orders this month)
    const activeUsers = await Order.distinct('userId', {
      createdAt: { $gte: startOfMonth }
    }).then(userIds => userIds.length);

    const lastMonthActiveUsers = await Order.distinct('userId', {
      createdAt: { $gte: lastMonth, $lte: endOfLastMonth }
    }).then(userIds => userIds.length);

    // Menu items count
    const totalMenuItems = await Food.countDocuments();
    const availableMenuItems = await Food.countDocuments({ isAvailable: true });

    // Calculate growth percentages
    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 1;
    const revenueGrowth = previousRevenue > 0 
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    const userGrowth = activeUsers - lastMonthActiveUsers;

    res.json({
      totalOrders,
      newOrders,
      totalRevenue: totalRevenueResult[0]?.total || 0,
      revenueGrowth,
      activeUsers,
      userGrowth,
      totalMenuItems,
      availableMenuItems
    });

  } catch (error) {
    console.error('❌ Error getting dashboard stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard statistics',
      error: error.message 
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('❌ Error getting users:', error);
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });

  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({ 
      message: 'Failed to update user role',
      error: error.message 
    });
  }
};

// Get system statistics
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalFoods = await Food.countDocuments();
    
    const orderStatsByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentActivity = await Order.find()
      .populate('userId', 'name email')
      .populate('items.food', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('customerName totalAmount status createdAt');

    res.json({
      totalUsers,
      totalOrders,
      totalFoods,
      orderStatsByStatus,
      recentActivity
    });

  } catch (error) {
    console.error('❌ Error getting system stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch system statistics',
      error: error.message 
    });
  }
};
