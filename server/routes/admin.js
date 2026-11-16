const express = require('express');

const router = express.Router();

const {
  getStats,
  getAllUsers,
  blockUser,
  deleteUser,
  getAllEvents,
  approveEvent,
  updateUserRole,
} = require('../controllers/adminController');

const {
  protect,
  authorize,
} = require('../middleware/auth');

// ========================================
// ADMIN PROTECTION
// ========================================

router.use(
  protect,
  authorize('admin')
);

// ========================================
// DASHBOARD
// ========================================

router.get(
  '/stats',
  getStats
);

// ========================================
// USERS
// ========================================

router.get(
  '/users',
  getAllUsers
);

router.put(
  '/users/:id/block',
  blockUser
);

router.put(
  '/users/:id/role',
  updateUserRole
);

router.delete(
  '/users/:id',
  deleteUser
);

// ========================================
// EVENTS
// ========================================

router.get(
  '/events',
  getAllEvents
);

router.put(
  '/events/:id/status',
  approveEvent
);

module.exports = router;