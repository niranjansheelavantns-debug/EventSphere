const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        'music',
        'sports',
        'tech',
        'arts',
        'food',
        'business',
        'education',
        'other',
      ],
      default: 'other',
    },

    date: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    time: {
      type: String,
      required: true,
    },

    location: {
      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
      },

      country: {
        type: String,
        default: 'India',
      },

      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    images: [{ type: String }],

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    availableSeats: {
      type: Number,
      required: true,
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },

    tags: [String],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Text Search Index
eventSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
});

// Filter/Search Index
eventSchema.index({
  'location.city': 1,
  category: 1,
  date: 1,
  price: 1,
});

module.exports = mongoose.model('Event', eventSchema);