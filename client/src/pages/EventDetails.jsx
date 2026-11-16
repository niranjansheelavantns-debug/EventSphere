import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getEventById, createBooking, createPaymentOrder, verifyPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [bookedData, setBookedData] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    getEventById(id)
      .then(({ data }) => { setEvent(data.event); setLoading(false); })
      .catch(() => { toast.error('Event not found'); navigate('/events'); });
  }, [id, navigate]);

  const handleBooking = async () => {
  if (!isAuthenticated) {
    navigate('/login');
    return;
  }

  if (seats < 1 || seats > event.availableSeats) return;

  setBooking(true);

  try {
    // Create booking in MongoDB
    const { data } = await createBooking({
      eventId: id,
      seatsBooked: seats,
      paymentMethod: "mock",
      paymentId: "PAY_" + Date.now(),
    });

    const booking = data.booking;

    // Success UI
    setBookedData(booking);

    setEvent((prev) => ({
      ...prev,
      availableSeats: prev.availableSeats - seats,
    }));

    toast.success("✅ Payment Successful!");
  } catch (err) {
    console.log(err);

    toast.error(
      err.response?.data?.message ||
      "Booking failed"
    );
  } finally {
    setBooking(false);
  }
};

  if (loading) return <LoadingSpinner fullScreen />;
  if (!event) return null;

  const { title, description, date, time, location, price, images, category, availableSeats, totalSeats, organizer, tags, refundPolicy, status } = event;
  const imgList = images?.length ? images : [PLACEHOLDER];
  const isSoldOut = availableSeats === 0;
  const isPast = new Date(date) < new Date();
  const total = price * seats;

  if (bookedData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="card p-10">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
          <p className="text-gray-400 mb-2">Booking ID: <span className="text-primary-400 font-mono font-semibold">{bookedData.bookingId}</span></p>
          <p className="text-gray-400 mb-6">{seats} seat(s) for <strong className="text-white">{title}</strong></p>
          {bookedData.qrCode && (
            <div className="flex justify-center mb-6">
              <img src={bookedData.qrCode} alt="QR Code" className="w-40 h-40 rounded-xl border border-white/10" />
            </div>
          )}
          <div className="flex gap-3">
            <Link to="/my-bookings" className="btn-primary flex-1">View My Bookings</Link>
            <button onClick={() => { setBookedData(null); setSeats(1); }} className="btn-secondary flex-1">Book More</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/events" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Event Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="rounded-2xl overflow-hidden">
            <img src={imgList[activeImg]} alt={title} className="w-full h-72 md:h-96 object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
            {imgList.length > 1 && (
              <div className="flex gap-2 mt-2">
                {imgList.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-primary-500' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-16 h-12 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Meta */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge bg-primary-500/20 text-primary-300 capitalize">{category}</span>
              {isPast && <span className="badge bg-gray-500/20 text-gray-400">Past Event</span>}
              {status === 'approved' && <span className="badge bg-green-500/20 text-green-300">✓ Verified</span>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: '📅', label: 'Date & Time', value: `${format(new Date(date), 'EEEE, MMMM d, yyyy')} at ${time}` },
                { icon: '📍', label: 'Location', value: `${location?.address}, ${location?.city}, ${location?.state}` },
                { icon: '🎟️', label: 'Price', value: price === 0 ? 'FREE' : `₹${price.toLocaleString()} per ticket` },
                { icon: '💺', label: 'Availability', value: `${availableSeats} of ${totalSeats} seats remaining` },
              ].map((item) => (
                <div key={item.label} className="card p-4">
                  <p className="text-gray-500 text-xs mb-1">{item.icon} {item.label}</p>
                  <p className="text-white font-medium text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-3">About This Event</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{description}</p>
          </div>

          {tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="badge bg-white/5 text-gray-400 border border-white/10">#{tag}</span>
              ))}
            </div>
          )}

          {organizer && (
            <div className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                {organizer.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Organized by</p>
                <p className="text-white font-semibold">{organizer.name}</p>
                <p className="text-gray-400 text-sm">{organizer.email}</p>
              </div>
            </div>
          )}

          {refundPolicy && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-2">Refund Policy</h3>
              <p className="text-gray-400 text-sm">{refundPolicy}</p>
            </div>
          )}
        </div>

        {/* Right: Booking Card */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h3 className="text-xl font-bold text-white mb-4">Book Tickets</h3>

            {isPast ? (
              <p className="text-gray-400 text-center py-4">This event has already passed.</p>
            ) : isSoldOut ? (
              <div className="text-center py-4">
                <div className="badge bg-red-500/20 text-red-300 text-sm mb-2">Sold Out</div>
                <p className="text-gray-400 text-sm">All tickets have been sold.</p>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <label className="block text-sm text-gray-400 mb-2">Number of Seats</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSeats(s => Math.max(1, s - 1))} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors">−</button>
                    <span className="text-2xl font-bold text-white w-12 text-center">{seats}</span>
                    <button onClick={() => setSeats(s => Math.min(availableSeats, s + 1))} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors">+</button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">Max {Math.min(availableSeats, 10)} per booking</p>
                </div>

                <div className="border-t border-white/10 pt-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{price === 0 ? 'Free entry' : `₹${price.toLocaleString()} × ${seats} seat(s)`}</span>
                    <span className="text-white">{price === 0 ? 'FREE' : `₹${(price * seats).toLocaleString()}`}</span>
                  </div>
                  {price > 0 && (
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-white">Total</span>
                      <span className="text-primary-400 text-lg">₹{total.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBooking}
                  disabled={booking || isSoldOut}
                  className="btn-primary w-full text-base"
                >
                  {booking ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : price === 0 ? 'Book Free Ticket' : `Pay ₹${total.toLocaleString()}`}
                </button>

                {!isAuthenticated && (
                  <p className="text-center text-gray-400 text-xs mt-3">
                    <Link to="/login" className="text-primary-400 hover:text-primary-300">Sign in</Link> to book tickets
                  </p>
                )}

                <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                  <p>🔒 Secure payment via Razorpay</p>
                  <p>🎟️ Instant e-ticket with QR code</p>
                  <p>📧 Confirmation via email</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
