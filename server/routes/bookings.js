const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingById, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.delete('/:id', protect, cancelBooking);

module.exports = router;
