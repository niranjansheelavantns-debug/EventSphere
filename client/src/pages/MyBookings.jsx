import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getMyBookings, cancelBooking } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_COLORS = {
  confirmed: 'bg-green-500/20 text-green-300',
  pending: 'bg-yellow-500/20 text-yellow-300',
  cancelled: 'bg-red-500/20 text-red-300',
  refunded: 'bg-blue-500/20 text-blue-300',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [qrModal, setQrModal] = useState(null);

  useEffect(() => {
  getMyBookings()
    .then(({ data }) => {
      setBookings(data.bookings || []);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
}, []);
  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await cancelBooking(id, { reason: 'Cancelled by user' });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled', paymentStatus: 'refunded' } : b));
      toast.success('Booking cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
    setCancelling(null);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="section-title">My Bookings</h1>
        <p className="text-gray-400">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>
      </div>

      {bookings.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🎟️</div>
          <h3 className="text-xl font-semibold text-white mb-2">No bookings yet</h3>
          <p className="text-gray-400 mb-6">Discover amazing events and book your first ticket!</p>
          <Link to="/events" className="btn-primary">Browse Events</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const evt = b.event;
            const isPast = evt?.date && new Date(evt.date) < new Date();
            return (
              <div key={b._id} className="card p-5 hover:border-white/20 transition-colors">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Image */}
                  {evt?.images?.[0] && (
                    <img src={evt.images[0]} alt={evt.title} className="w-full sm:w-28 h-24 object-cover rounded-xl flex-shrink-0" />
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <Link to={`/events/${evt?._id}`} className="text-white font-semibold hover:text-primary-300 transition-colors line-clamp-1">
                          {evt?.title || 'Event'}
                        </Link>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{b.bookingId}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`badge ${STATUS_COLORS[b.status] || ''}`}>{b.status}</span>
                        <span className={`badge ${STATUS_COLORS[b.paymentStatus] || ''}`}>{b.paymentStatus}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-400 mt-3">
                      <div><p className="text-xs text-gray-500">Date</p><p className="text-gray-200">{evt?.date ? format(new Date(evt.date), 'MMM d, yyyy') : '—'}</p></div>
                      <div><p className="text-xs text-gray-500">Location</p><p className="text-gray-200 truncate">{evt?.location?.city || '—'}</p></div>
                      <div><p className="text-xs text-gray-500">Seats</p><p className="text-gray-200">{b.seatsBooked}</p></div>
                      <div><p className="text-xs text-gray-500">Total</p><p className="text-primary-400 font-semibold">{b.totalAmount === 0 ? 'FREE' : `₹${b.totalAmount.toLocaleString()}`}</p></div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {b.qrCode && (
                        <button onClick={() => setQrModal(b)} className="text-xs text-primary-400 hover:text-primary-300 border border-primary-500/30 px-3 py-1.5 rounded-lg transition-colors">
                          View QR
                        </button>
                      )}
                      {!isPast && b.status === 'confirmed' && (
                        <button onClick={() => handleCancel(b._id)} disabled={cancelling === b._id}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                          {cancelling === b._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setQrModal(null)}>
          <div className="card p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-1">E-Ticket</h3>
            <p className="text-gray-400 text-sm mb-4">{qrModal.event?.title}</p>
            <img src={qrModal.qrCode} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl border border-white/10 mb-4" />
            <p className="text-primary-400 font-mono font-bold">{qrModal.bookingId}</p>
            <p className="text-gray-400 text-sm mt-1">{qrModal.seatsBooked} seat(s)</p>
            <button onClick={() => setQrModal(null)} className="btn-secondary mt-4 w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
