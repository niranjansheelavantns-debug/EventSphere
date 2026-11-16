const express = require('express');

const router = express.Router();

const {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  createStripeIntent,
} = require('../controllers/paymentController');

const {
  protect,
} = require('../middleware/auth');

// ========================================
// CREATE RAZORPAY ORDER
// ========================================

router.post(
  '/create-order',
  protect,
  createOrder
);

// ========================================
// VERIFY PAYMENT
// ========================================

router.post(
  '/verify',
  protect,
  verifyPayment
);

// ========================================
// PAYMENT HISTORY
// ========================================

router.get(
  '/history',
  protect,
  getPaymentHistory
);

// ========================================
// STRIPE PAYMENT INTENT
// ========================================

router.post(
  '/stripe-intent',
  protect,
  createStripeIntent
);

module.exports = router;