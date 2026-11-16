const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventmanagement');
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Event.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@eventms.com',
    password: 'Admin@123',
    role: 'admin',
  });

  // Create organizer
  const organizer = await User.create({
    name: 'John Organizer',
    email: 'organizer@eventms.com',
    password: 'Organizer@123',
    role: 'organizer',
  });

  // Create user
  await User.create({
    name: 'Jane User',
    email: 'user@eventms.com',
    password: 'User@123',
    role: 'user',
  });

  // Create sample events
  const events = [
    {
      title: 'Tech Summit 2025',
      description: 'Join the biggest tech summit of the year. Keynotes, workshops, networking with industry leaders.',
      category: 'tech',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: '09:00 AM',
      location: { address: 'HICC Convention Centre', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'],
      price: 1500,
      totalSeats: 500,
      availableSeats: 500,
      organizer: organizer._id,
      status: 'approved',
      isFeatured: true,
      tags: ['technology', 'innovation', 'networking'],
    },
    {
      title: 'Mumbai Music Festival',
      description: 'A 2-day music festival featuring top indie artists, jazz bands, and electronic music DJs.',
      category: 'music',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: '05:00 PM',
      location: { address: 'Bandra Amphitheatre', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      images: ['https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800'],
      price: 2000,
      totalSeats: 1000,
      availableSeats: 1000,
      organizer: organizer._id,
      status: 'approved',
      isFeatured: true,
      tags: ['music', 'festival', 'live'],
    },
    {
      title: 'Startup Pitch Night',
      description: 'Watch 10 promising startups pitch to top VCs and angels. Network with founders and investors.',
      category: 'business',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: '06:30 PM',
      location: { address: '91springboard, Koramangala', city: 'Bangalore', state: 'Karnataka', country: 'India' },
      images: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=800'],
      price: 500,
      totalSeats: 200,
      availableSeats: 200,
      organizer: organizer._id,
      status: 'approved',
      isFeatured: false,
      tags: ['startup', 'investment', 'pitching'],
    },
    {
      title: 'Yoga & Wellness Retreat',
      description: 'A full-day wellness retreat with yoga, meditation, ayurvedic food, and expert sessions.',
      category: 'other',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      time: '07:00 AM',
      location: { address: 'Lal Bagh Botanical Garden', city: 'Bangalore', state: 'Karnataka', country: 'India' },
      images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'],
      price: 800,
      totalSeats: 100,
      availableSeats: 100,
      organizer: organizer._id,
      status: 'approved',
      isFeatured: true,
      tags: ['yoga', 'wellness', 'meditation'],
    },
    {
      title: 'Food & Culture Fest',
      description: 'Explore 50+ food stalls, cultural performances, and artisan crafts from across India.',
      category: 'food',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      time: '11:00 AM',
      location: { address: 'Jawaharlal Nehru Stadium', city: 'Delhi', state: 'Delhi', country: 'India' },
      images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'],
      price: 0,
      totalSeats: 5000,
      availableSeats: 5000,
      organizer: organizer._id,
      status: 'approved',
      isFeatured: true,
      tags: ['food', 'culture', 'festival'],
    },
    {
      title: 'Photography Masterclass',
      description: 'Learn professional photography techniques from award-winning photographers. All levels welcome.',
      category: 'arts',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      time: '10:00 AM',
      location: { address: 'Creative Hub, Baner', city: 'Pune', state: 'Maharashtra', country: 'India' },
      images: ['https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800'],
      price: 1200,
      totalSeats: 30,
      availableSeats: 30,
      organizer: organizer._id,
      status: 'approved',
      isFeatured: false,
      tags: ['photography', 'arts', 'workshop'],
    },
  ];

  await Event.insertMany(events);

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin:     admin@eventms.com     / Admin@123');
  console.log('Organizer: organizer@eventms.com / Organizer@123');
  console.log('User:      user@eventms.com      / User@123');

  await mongoose.disconnect();
};

seed().catch(console.error);
