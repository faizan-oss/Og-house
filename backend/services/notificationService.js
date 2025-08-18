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
    console.log('User connected:', socket.id);

    // Join admin room
    socket.on('join-admin', () => {
      socket.join('admin-room');
      console.log('Admin joined admin room');
    });

    // Join user room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined user room`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
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
    const io = getIO();
    io.to('admin-room').emit('new-order', {
      type: 'new-order',
      order: {
        id: order._id,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items
      },
      message: `New order placed by ${order.customerName} for $${order.totalAmount}`,
      timestamp: new Date()
    });
    console.log(`📢 Admin notification sent: New order from ${order.customerName}`);
  } catch (error) {
    console.error('Error in notifyAdminNewOrder:', error);
  }
}

// Notify user about order status change
function notifyUserOrderStatusChange(userId, order, newStatus) {
  try {
    const statusMessages = {
      'Accepted': 'Your order has been accepted and is being prepared!',
      'On The Way': 'Your order is on the way!',
      'Completed': 'Your order has been completed. Enjoy your meal!',
      'Cancelled': 'Your order has been cancelled.'
    };

    const message = statusMessages[newStatus] || `Order status updated to ${newStatus}`;
    
    const io = getIO();
    io.to(`user-${userId}`).emit('order-status-update', {
      type: 'order-status-update',
      orderId: order._id,
      status: newStatus,
      message: message,
      timestamp: new Date()
    });
    console.log(`📱 User notification sent: ${message} (User: ${userId})`);
  } catch (error) {
    console.error('Error in notifyUserOrderStatusChange:', error);
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
