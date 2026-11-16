const Event = require('../models/Event');
const Booking = require('../models/Booking');

// ========================================
// GET ALL EVENTS
// ========================================

exports.getEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      city,
      minPrice,
      maxPrice,
      date,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    const query = {
      status: 'approved',
    };

    // Search
    if (search) {
      query.$text = {
        $search: search,
      };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // City filter
    if (city) {
      query['location.city'] = {
        $regex: city,
        $options: 'i',
      };
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Date filter
    if (date) {
      const d = new Date(date);

      query.date = {
        $gte: d,
        $lt: new Date(d.getTime() + 86400000),
      };
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizer', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),

      Event.countDocuments(query),
    ]);

    res.json({
      success: true,
      events,
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// GET SINGLE EVENT
// ========================================

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar phone');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// CREATE EVENT
// ========================================

exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id,
    };

    // Build location object from form fields
    eventData.location = {
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country || 'India',
    };

    // Tags
    if (req.body.tags) {
      eventData.tags = req.body.tags
        .split(',')
        .map(tag => tag.trim());
    }

    // Images from multer upload
    if (req.files && req.files.length > 0) {
      eventData.images = req.files.map(
        file => `/uploads/${file.filename}`
      );
    }

    // Seats
    eventData.availableSeats = req.body.totalSeats;

    // Organizer events start pending approval
    eventData.status = 'pending';

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      event,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// UPDATE EVENT
// ========================================

exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const updateData = {
      ...req.body,
    };

    if (typeof updateData.location === 'string') {
      updateData.location = JSON.parse(updateData.location);
    }

    if (typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      event,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// DELETE EVENT
// ========================================

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// GET MY EVENTS
// ========================================

exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.user._id,
    }).sort('-createdAt');

    res.json({
      success: true,
      events,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// GET EVENT BOOKINGS
// ========================================

exports.getEventBookings = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (
      event.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const bookings = await Booking.find({
      event: req.params.id,
    }).populate('user', 'name email phone');

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
// GET FEATURED EVENTS
// ========================================

exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: 'approved',
      isFeatured: true,
      date: { $gte: new Date() },
    })
      .populate('organizer', 'name avatar')
      .limit(6)
      .sort('date');

    res.json({
      success: true,
      events,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// GET UPCOMING EVENTS
// ========================================

exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: 'approved',
      date: { $gte: new Date() },
    })
      .sort('date')
      .limit(10);

    res.json({
      success: true,
      events,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};