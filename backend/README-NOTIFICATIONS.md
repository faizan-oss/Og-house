# 🍔 Og House - Real-time Notification System

This system provides real-time notifications for both admin and user when orders are placed or status changes occur.

## 🚀 Features

### Admin Notifications
- **Real-time alerts** when new orders are placed
- **Email notifications** (if SMTP configured)
- **Navbar notifications** for immediate attention

### User Notifications
- **Order status updates** (Accepted, On The Way, Completed, Cancelled)
- **Real-time updates** without page refresh
- **Personalized messages** for each status

## 📋 Setup

### 1. Environment Variables
Add these to your `.env` file:

```env
# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=The Og House <your@gmail.com>

# Admin Emails (fallback if no admin users in DB)
ADMIN_EMAILS=admin1@oghouse.com,admin2@oghouse.com
```

### 2. Dependencies
```bash
npm install nodemailer socket.io
```

## 🔌 How It Works

### Socket.IO Events

#### Admin Events
- `join-admin`: Admin joins admin room to receive notifications
- `new-order`: Admin receives notification when order is placed

#### User Events
- `join-user`: User joins personal room using their userId
- `order-status-update`: User receives status change notifications

### Notification Flow

1. **Order Placed**:
   - Admin gets real-time notification + email
   - User gets confirmation

2. **Status Updated**:
   - User gets real-time notification
   - Admin can see status change in dashboard

## 💻 Frontend Integration

### Admin Dashboard
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join admin room
socket.emit('join-admin');

// Listen for new orders
socket.on('new-order', (data) => {
  console.log('New order:', data.order);
  // Show notification in navbar
  showNotification(data.message);
});
```

### User Interface
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join user room
socket.emit('join-user', userId);

// Listen for status updates
socket.on('order-status-update', (data) => {
  console.log('Status update:', data);
  // Show notification to user
  showUserNotification(data.message);
});
```

## 🧪 Testing

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Open test page**:
   - Navigate to `auth-backend/test-notifications.html`
   - Or open in browser: `file:///path/to/test-notifications.html`

3. **Test scenarios**:
   - Join as admin → Create order → See admin notification
   - Join as user → Update order status → See user notification

## 📱 Notification Types

### Admin Notifications
- **New Order**: Customer name, amount, items
- **Status Changes**: Order updates in real-time

### User Notifications
- **Accepted**: "Your order has been accepted and is being prepared!"
- **On The Way**: "Your order is on the way!"
- **Completed**: "Your order has been completed. Enjoy your meal!"
- **Cancelled**: "Your order has been cancelled."

## 🔧 Customization

### Add New Status Types
1. Update `orderModel.js` enum
2. Add status message in `notificationService.js`
3. Update frontend status handling

### Custom Notification Messages
Modify the `statusMessages` object in `notificationService.js`:

```javascript
const statusMessages = {
  'Accepted': 'Your custom message here',
  'On The Way': 'Another custom message',
  // ... add more
};
```

### Email Templates
Customize email HTML in `emailService.js` by modifying the `buildOrderEmailHtml` function.

## 🚨 Troubleshooting

### Notifications Not Working?
1. Check Socket.IO connection in browser console
2. Verify server is running on correct port
3. Check CORS settings if frontend is on different domain

### Emails Not Sending?
1. Verify SMTP credentials in `.env`
2. Check if admin users exist in database
3. Look for console warnings about missing configuration

### Socket Connection Issues?
1. Ensure `socket.io` is installed
2. Check server initialization in `server.js`
3. Verify frontend Socket.IO version compatibility

## 📞 Support

For issues or questions about the notification system, check:
1. Server console logs
2. Browser console for Socket.IO errors
3. Network tab for API calls
4. Environment variable configuration
