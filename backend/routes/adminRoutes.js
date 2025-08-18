const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getSystemStats
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);

// System statistics
router.get('/stats', getSystemStats);

module.exports = router;
