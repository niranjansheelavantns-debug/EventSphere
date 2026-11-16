const Razorpay = require('razorpay');

const Stripe = require('stripe');

const Booking = require('../models/Booking');

const Event = require('../models/Event');

const Payment = require('../models/Payment');

const crypto = require('crypto');

// ========================================
// RAZORPAY INSTANCE
// ========================================

const getRazorpay = () =>
  new Razorpay({
    key_id:
      process.env.RAZORPAY_KEY_ID,

    key_secret:
      process.env
        .RAZORPAY_KEY_SECRET,
  });

// ========================================
// CREATE ORDER
// ========================================

exports.createOrder = async (
  req,
  res
) => {
  try {
    const {
      eventId,
      seatsBooked,
    } = req.body;

    // Find event
    const event =
      await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Calculate amount
    const amount =
      event.price *
      seatsBooked *
      100;

    // Razorpay instance
    const razorpay =
      getRazorpay();

    // Create order
    const order =
      await razorpay.orders.create({
        amount,
        currency: 'INR',

        receipt: `receipt_${Date.now()}`,
      });

    // Save payment record
    await Payment.create({
      user: req.user._id,

      amount: amount / 100,

      paymentMethod:
        'razorpay',

      transactionId: order.id,

      status: 'pending',
    });

    res.json({
      success: true,

      order,

      key:
        process.env
          .RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// VERIFY PAYMENT
// ========================================

exports.verifyPayment = async (
  req,
  res
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // Generate signature
    const body =
      razorpay_order_id +
      '|' +
      razorpay_payment_id;

    const expectedSignature =
      crypto
        .createHmac(
          'sha256',
          process.env
            .RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest('hex');

    // Signature verification
    if (
      expectedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid payment signature',
      });
    }

    // Update booking
    const booking =
      await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: 'confirmed',

          paymentStatus:
            'completed',

          paymentId:
            razorpay_payment_id,
        },
        {
          new: true,
        }
      );

    // Update payment
    await Payment.findOneAndUpdate(
      {
        transactionId:
          razorpay_order_id,
      },
      {
        status: 'completed',
      }
    );

    res.json({
      success: true,

      message:
        'Payment verified successfully',

      booking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// GET PAYMENT HISTORY
// ========================================

exports.getPaymentHistory =
  async (req, res) => {
    try {
      const payments =
        await Payment.find({
          user: req.user._id,
        }).sort('-createdAt');

      res.json({
        success: true,
        payments,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };

// ========================================
// CREATE STRIPE PAYMENT INTENT
// ========================================

exports.createStripeIntent =
  async (req, res) => {
    try {
      const {
        eventId,
        seatsBooked,
      } = req.body;

      const event =
        await Event.findById(
          eventId
        );

      if (!event) {
        return res.status(404).json({
          success: false,
          message:
            'Event not found',
        });
      }

      // Stripe instance
      const stripe = new Stripe(
        process.env
          .STRIPE_SECRET_KEY
      );

      // Create payment intent
      const paymentIntent =
        await stripe.paymentIntents.create(
          {
            amount:
              event.price *
              seatsBooked *
              100,

            currency: 'inr',

            metadata: {
              eventId:
                eventId.toString(),

              userId:
                req.user._id.toString(),

              seats:
                seatsBooked,
            },
          }
        );

      res.json({
        success: true,

        clientSecret:
          paymentIntent.client_secret,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };