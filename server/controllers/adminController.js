const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// ========================================
// GET DASHBOARD STATS
// ========================================

exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalBookings,
      revenueData,
      recentBookings,
      eventsByCategory,
      monthlyStats,
    ] = await Promise.all([
      User.countDocuments({
        role: { $ne: 'admin' },
      }),

      Event.countDocuments(),

      Booking.countDocuments({
        status: 'confirmed',
      }),

      Booking.aggregate([
        {
          $match: {
            status: 'confirmed',
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$totalAmount',
            },
          },
        },
      ]),

      Booking.find()
        .populate('user', 'name email')
        .populate('event', 'title')
        .sort('-createdAt')
        .limit(10),

      Event.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),

      Booking.aggregate([
        {
          $match: {
            status: 'confirmed',
            createdAt: {
              $gte: new Date(
                Date.now() - 180 * 86400000
              ),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m',
                date: '$createdAt',
              },
            },

            revenue: {
              $sum: '$totalAmount',
            },

            bookings: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),
    ]);

    const pendingEvents =
      await Event.countDocuments({
        status: 'pending',
      });

    res.json({
      success: true,

      stats: {
        totalUsers,
        totalEvents,
        totalBookings,

        totalRevenue:
          revenueData[0]?.total || 0,

        recentBookings,
        eventsByCategory,
        monthlyStats,
        pendingEvents,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// GET ALL USERS
// ========================================

exports.getAllUsers = async (
  req,
  res
) => {
  try {
    const {
      role,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    const skip =
      (page - 1) * limit;

    const [users, total] =
      await Promise.all([
        User.find(query)
          .sort('-createdAt')
          .skip(skip)
          .limit(Number(limit)),

        User.countDocuments(query),
      ]);

    res.json({
      success: true,
      users,
      total,
      pages: Math.ceil(
        total / limit
      ),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// DELETE USER
// ========================================

exports.deleteUser = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message:
          'Cannot delete admin',
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message:
        'User deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// BLOCK / UNBLOCK USER
// ========================================

exports.blockUser = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isBlocked =
      !user.isBlocked;

    await user.save();

    res.json({
      success: true,
      message: `User ${
        user.isBlocked
          ? 'blocked'
          : 'unblocked'
      } successfully`,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// UPDATE USER ROLE
// ========================================

exports.updateUserRole = async (
  req,
  res
) => {
  try {
    const { role } = req.body;

    const allowedRoles = [
      'user',
      'organizer',
      'admin',
    ];

    if (
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const user =
      await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message:
        'User role updated successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// GET ALL EVENTS
// ========================================

exports.getAllEvents = async (
  req,
  res
) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const query = status
      ? { status }
      : {};

    const skip =
      (page - 1) * limit;

    const [events, total] =
      await Promise.all([
        Event.find(query)
          .populate(
            'organizer',
            'name email'
          )
          .sort('-createdAt')
          .skip(skip)
          .limit(Number(limit)),

        Event.countDocuments(query),
      ]);

    res.json({
      success: true,
      events,
      total,
      pages: Math.ceil(
        total / limit
      ),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ========================================
// APPROVE EVENT
// ========================================

exports.approveEvent = async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !['approved', 'rejected', 'pending'].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const event =
      await Event.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      message: `Event ${status} successfully`,
      event,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};