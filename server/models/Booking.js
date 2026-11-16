const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      default: () =>
        'BK' + Date.now() + Math.floor(Math.random() * 1000),
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },

    seatsBooked: {
      type: Number,
      required: true,
      min: 1,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },

    paymentMethod: {
      type: String,
      default: 'mock',
    },

    paymentId: {
      type: String,
    },

    qrCode: {
      type: String,
    },

    cancelledAt: Date,

    cancelReason: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);