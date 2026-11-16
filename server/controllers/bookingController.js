const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');

// ========================================
// CREATE BOOKING
// ========================================

exports.createBooking = async (req, res) => {
  try {
    const {
      eventId,
      seatsBooked,
      paymentMethod = 'free',
      paymentId,
    } = req.body;

    // Find event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Event approval check
    if (event.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Event not available',
      });
    }

    // Seat check
    if (event.availableSeats < seatsBooked) {
      return res.status(400).json({
        success: false,
        message: 'Not enough seats available',
      });
    }

    // Total amount
    const totalAmount = event.price * seatsBooked;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      seatsBooked,
      totalAmount,

      status:
        totalAmount === 0
          ? 'confirmed'
          : 'pending',

      paymentStatus:
        totalAmount === 0
          ? 'completed'
          : 'pending',

      paymentMethod:
        totalAmount === 0
          ? 'free'
          : paymentMethod,

      paymentId,
    });

    // Update available seats
    await Event.findByIdAndUpdate(
      eventId,
      {
        $inc: {
          availableSeats: -seatsBooked,
        },
      }
    );

    // Generate QR Code
    const qrData = JSON.stringify({
      bookingId: booking.bookingId,
      eventId,
      userId: req.user._id,
    });

    const qrCode = await QRCode.toDataURL(qrData);

    booking.qrCode = qrCode;

    // Confirm booking if payment done
    if (totalAmount === 0 || paymentId) {
      booking.status = 'confirmed';
    }

    await booking.save();

    // Socket.IO realtime update
    const io = req.app.get('io');

    if (io) {
      io.to(`event-${eventId}`).emit(
        'seats-updated',
        {
          availableSeats:
            event.availableSeats - seatsBooked,
        }
      );
    }

    // Populate booking
    const populatedBooking =
      await booking.populate([
        {
          path: 'event',
          select:
            'title date location images',
        },
        {
          path: 'user',
          select: 'name email',
        },
      ]);

    res.status(201).json({
      success: true,
      booking: populatedBooking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// GET MY BOOKINGS
// ========================================

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate(
        'event',
        'title date location images price category'
      )
      .sort('-createdAt');

    res.json({
      success: true,
      bookings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// GET SINGLE BOOKING
// ========================================

exports.getBookingById = async (
  req,
  res
) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    )
      .populate(
        'event',
        'title date location images organizer'
      )
      .populate(
        'user',
        'name email phone'
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization
    if (
      booking.user._id.toString() !==
        req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    res.json({
      success: true,
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
// CANCEL BOOKING
// ========================================

exports.cancelBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      ).populate('event');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Authorization
    if (
      booking.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Already cancelled
    if (
      booking.status === 'cancelled'
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Booking already cancelled',
      });
    }

    // Cancel booking
    booking.status = 'cancelled';

    booking.cancelledAt =
      new Date();

    booking.cancelReason =
      req.body.reason ||
      'User cancelled';

    await booking.save();

    // Restore seats
    await Event.findByIdAndUpdate(
      booking.event._id,
      {
        $inc: {
          availableSeats:
            booking.seatsBooked,
        },
      }
    );

    // Socket realtime update
    const io = req.app.get('io');

    if (io) {
      io.to(
        `event-${booking.event._id}`
      ).emit('seats-updated', {
        availableSeats:
          booking.event.availableSeats +
          booking.seatsBooked,
      });
    }

    res.json({
      success: true,
      message:
        'Booking cancelled successfully',
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
// GET ALL BOOKINGS (ADMIN)
// ========================================

exports.getAllBookings = async (
  req,
  res
) => {
  try {
    const bookings = await Booking.find()
      .populate(
        'user',
        'name email'
      )
      .populate(
        'event',
        'title date'
      )
      .sort('-createdAt')
      .limit(100);

    res.json({
      success: true,
      bookings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};