const io = require('socket.io');

let ioInstance = null;

function initializeSocket(server) {
  ioInstance = io(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log('🔔 [NotificationService] User connected:', socket.id);

    // Join admin room
    socket.on('join-admin', () => {
      socket.join('admin-room');
      console.log('🔔 [NotificationService] Admin joined admin room');
    });

    // Join user room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`🔔 [NotificationService] User ${userId} joined user room`);
    });

    socket.on('disconnect', () => {
      console.log('🔔 [NotificationService] User disconnected:', socket.id);
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return ioInstance;
}

// Notify admins about new order
function notifyAdminNewOrder(order) {
  try {
    console.log('🔔 [NotificationService] Attempting to notify admin about new order:', order._id);
    
    const io = getIO();
    console.log('🔔 [NotificationService] Socket.IO instance obtained:', !!io);
    
    const notificationData = {
      type: 'new-order',
      order: {
        id: order._id,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items
      },
      message: `New order placed by ${order.customerName} for ₹${order.totalAmount}`,
      timestamp: new Date()
    };
    
    io.to('admin-room').emit('new-order', notificationData);
    
    console.log(`✅ [NotificationService] Admin notification sent: New order from ${order.customerName}`);
    
  } catch (error) {
    console.error('❌ [NotificationService] Error in notifyAdminNewOrder:', error);
    console.error('❌ [NotificationService] Error stack:', error.stack);
  }
}

// Notify user about order status change
function notifyUserOrderStatusChange(userId, order, newStatus) {
  try {
    console.log(`🔔 [NotificationService] Attempting to notify user ${userId} about status change to ${newStatus}`);
    
    const io = getIO();
    console.log('🔔 [NotificationService] Socket.IO instance obtained:', !!io);
    
    const statusMessages = {
      'Accepted': 'Your order has been accepted and is being prepared!',
      'Preparing': 'Your order is being prepared in the kitchen!',
      'On The Way': 'Your order is on the way!',
      'Delivered': 'Your order has been delivered. Enjoy your meal!',
      'Cancelled': 'Your order has been cancelled.'
    };
    
    const message = statusMessages[newStatus] || `Order status updated to ${newStatus}`;
    
    const notificationData = {
      type: 'order-status-update',
      orderId: order._id,
      status: newStatus,
      message: message,
      timestamp: new Date()
    };
    
    io.to(`user-${userId}`).emit('order-status-update', notificationData);
    
    console.log(`✅ [NotificationService] User notification sent: ${message} (User: ${userId})`);
    
  } catch (error) {
    console.error('❌ [NotificationService] Error in notifyUserOrderStatusChange:', error);
    console.error('❌ [NotificationService] Error stack:', error.stack);
  }
}

// Notify user about order acceptance
function notifyUserOrderAccepted(userId, order) {
  notifyUserOrderStatusChange(userId, order, 'Accepted');
}

// Notify user about order completion
function notifyUserOrderCompleted(userId, order) {
  notifyUserOrderStatusChange(userId, order, 'Completed');
}

// Notify user about order being on the way
function notifyUserOrderOnTheWay(userId, order) {
  notifyUserOrderStatusChange(userId, order, 'On The Way');
}

module.exports = {
  initializeSocket,
  getIO,
  notifyAdminNewOrder,
  notifyUserOrderStatusChange,
  notifyUserOrderAccepted,
  notifyUserOrderCompleted,
  notifyUserOrderOnTheWay
};
