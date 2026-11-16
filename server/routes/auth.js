const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// ========================================
// REGISTER USER
// ========================================

router.post(
  '/register',
  [
    body('name')
      .notEmpty()
      .withMessage('Name is required'),

    body('email')
      .isEmail()
      .withMessage('Valid email is required'),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  register
);

// ========================================
// LOGIN USER
// ========================================

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required'),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  login
);

// ========================================
// GET CURRENT USER
// ========================================

router.get('/me', protect, getMe);

// ========================================
// UPDATE PROFILE
// ========================================

router.put('/profile', protect, updateProfile);

// ========================================
// CHANGE PASSWORD
// ========================================

router.put('/change-password', protect, changePassword);

module.exports = router;