const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { initializeSocket } = require('./services/notificationService');
const { sendOrderPlacedEmail } = require('./services/emailService');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: "*", // Temporarily allow all for testing
    credentials: true
  }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");
//const paymentRoutes = require("./routes/paymentRoutes");//

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
//app.use("/api/payments", paymentRoutes);*/

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "The Og House Backend is running! 🍕" });
});

// Test email endpoint
app.get("/api/test-email", async (req, res) => {
  try {
    const testOrder = {
      _id: "test_order_123",
      customerName: "Test Customer",
      totalAmount: 500,
      items: [
        { food: { name: "Test Pizza", price: 500 } }
      ]
    };
    
    await sendOrderPlacedEmail(testOrder);
    res.json({ message: "Test email sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Gmail SMTP endpoint
app.get("/api/test-gmail", async (req, res) => {
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.verify();
    res.json({ 
      message: "Gmail SMTP connection successful!", 
      info: info 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test notification endpoint
app.get("/api/test-notification", async (req, res) => {
  try {
    const { notifyAdminNewOrder, notifyUserOrderStatusChange } = require('./services/notificationService');
    const testOrder = { 
      _id: 'test_order_123',
      customerName: 'Test Customer',
      totalAmount: 500,
      status: 'Accepted',
      createdAt: new Date(),
      items: [{ food: { name: 'Test Food' } }]
    };
    
    // Test admin notification
    notifyAdminNewOrder(testOrder);
    
    // Test user notification after 1 second
    setTimeout(() => {
      notifyUserOrderStatusChange("test_user_123", testOrder, "Accepted");
    }, 1000);
    
    res.json({ 
      message: "Test notifications sent! Check console and connected clients.", 
      testOrder: testOrder,
      note: "Admin notification sent immediately, user notification sent after 1 second"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test user notification endpoint
app.get("/api/test-user-notification/:userId", async (req, res) => {
  try {
    const { notifyUserOrderStatusChange } = require('./services/notificationService');
    const { userId } = req.params;
    
    const testOrder = { 
      _id: 'test_order_456',
      customerName: 'Test Customer',
      totalAmount: 750,
      status: 'Preparing',
      createdAt: new Date(),
      items: [{ food: { name: 'Test Food 2' } }]
    };
    
    console.log(`🧪 [Test] Sending test notification to user: ${userId}`);
    notifyUserOrderStatusChange(userId, testOrder, "Preparing");
    
    res.json({ 
      message: `Test user notification sent to user ${userId}!`, 
      testOrder: testOrder,
      targetUserId: userId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug Socket.IO connections endpoint
app.get("/api/debug-socket", (req, res) => {
  try {
    const { getIO } = require('./services/notificationService');
    const io = getIO();
    
    const allSockets = Array.from(io.sockets.sockets.values()).map(socket => ({
      id: socket.id,
      rooms: Array.from(socket.rooms)
    }));
    
    const allRooms = Array.from(io.sockets.adapter.rooms.keys());
    
    res.json({
      totalConnections: io.sockets.sockets.size,
      allSockets: allSockets,
      allRooms: allRooms,
      adminRoomExists: allRooms.includes('admin-room'),
      userRooms: allRooms.filter(room => room.startsWith('user-')),
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Test the server: http://localhost:${PORT}/api/test`);
});

// Initialize Socket.IO
initializeSocket(server);
