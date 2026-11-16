const express = require('express');

const router = express.Router();

const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getEventBookings,
  getFeaturedEvents,
  getUpcomingEvents,
} = require('../controllers/eventController');

const { protect, authorize } = require('../middleware/auth');
const { uploadImages } = require('../middleware/upload');

// ========================================
// PUBLIC ROUTES
// ========================================

// Get all events
router.get('/', getEvents);

// Get featured events
router.get('/featured', getFeaturedEvents);

// Get upcoming events
router.get('/upcoming', getUpcomingEvents);

// Get single event by ID
router.get('/:id', getEventById);

// ========================================
// PROTECTED ROUTES
// ========================================

// Get organizer/admin own events
router.get(
  '/my/events',
  protect,
  authorize('organizer', 'admin'),
  getMyEvents
);

// Get bookings of a specific event
router.get(
  '/:id/bookings',
  protect,
  authorize('organizer', 'admin'),
  getEventBookings
);

// Create new event
router.post(
  '/',
  protect,
  authorize('organizer', 'admin'),
  uploadImages,
  createEvent
);

// Update event
router.put(
  '/:id',
  protect,
  authorize('organizer', 'admin'),
  uploadImages,
  updateEvent
);

// Delete event
router.delete(
  '/:id',
  protect,
  authorize('organizer', 'admin'),
  deleteEvent
);

module.exports = router;