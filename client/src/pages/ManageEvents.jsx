import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getMyEvents, deleteEvent } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_COLORS = {
  approved: 'bg-green-500/20 text-green-300',
  pending: 'bg-yellow-500/20 text-yellow-300',
  rejected: 'bg-red-500/20 text-red-300',
  cancelled: 'bg-gray-500/20 text-gray-400',
};

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getMyEvents().then(({ data }) => { setEvents(data.events || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event permanently?')) return;
    setDeleting(id);
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e._id !== id));
      toast.success('Event deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    setDeleting(null);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">My Events</h1>
          <p className="text-gray-400">{events.length} event{events.length !== 1 ? 's' : ''} created</p>
        </div>
        <Link to="/events/create" className="btn-primary">+ Create Event</Link>
      </div>

      {events.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🎪</div>
          <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
          <p className="text-gray-400 mb-6">Create your first event and start selling tickets!</p>
          <Link to="/events/create" className="btn-primary">Create Event</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev._id} className="card p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                {ev.images?.[0] && (
                  <img src={ev.images[0]} alt={ev.title} className="w-full sm:w-32 h-24 object-cover rounded-xl flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-semibold">{ev.title}</h3>
                    <span className={`badge ${STATUS_COLORS[ev.status] || ''}`}>{ev.status}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-400 mt-2">
                    <div><p className="text-xs text-gray-500">Date</p><p className="text-gray-200">{format(new Date(ev.date), 'MMM d, yyyy')}</p></div>
                    <div><p className="text-xs text-gray-500">Location</p><p className="text-gray-200 truncate">{ev.location?.city}</p></div>
                    <div><p className="text-xs text-gray-500">Price</p><p className="text-gray-200">{ev.price === 0 ? 'FREE' : `₹${ev.price}`}</p></div>
                    <div><p className="text-xs text-gray-500">Seats Left</p><p className="text-gray-200">{ev.availableSeats}/{ev.totalSeats}</p></div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Link to={`/events/${ev._id}`} className="text-xs border border-white/10 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-colors">View</Link>
                    <Link to={`/events/${ev._id}/edit`} className="text-xs border border-primary-500/30 px-3 py-1.5 rounded-lg text-primary-400 hover:text-primary-300 transition-colors">Edit</Link>
                    <Link to={`/booking-overview?eventId=${ev._id}`} className="text-xs border border-blue-500/30 px-3 py-1.5 rounded-lg text-blue-400 hover:text-blue-300 transition-colors">Bookings</Link>
                    <button onClick={() => handleDelete(ev._id)} disabled={deleting === ev._id}
                      className="text-xs border border-red-500/30 px-3 py-1.5 rounded-lg text-red-400 hover:text-red-300 transition-colors disabled:opacity-50">
                      {deleting === ev._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
