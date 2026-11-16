import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getAdminEvents, approveEvent } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_COLORS = {
  approved: 'bg-green-500/20 text-green-300',
  pending: 'bg-yellow-500/20 text-yellow-300',
  rejected: 'bg-red-500/20 text-red-300',
  cancelled: 'bg-gray-500/20 text-gray-400',
};

export default function EventApproval() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminEvents({ status: statusFilter });
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const handleStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      const { data } = await approveEvent(id, { status });
      setEvents(prev => prev.map(e => e._id === id ? { ...e, status: data.event.status } : e));
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    setActionLoading(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="section-title">Event Approval</h1>
          <p className="text-gray-400">{total} events</p>
        </div>
        <div className="flex gap-2">
          {['pending','approved','rejected','all'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s === 'all' ? '' : s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${(statusFilter === s || (s === 'all' && !statusFilter)) ? 'bg-primary-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : events.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No events in this category.</div>
      ) : (
        <div className="space-y-4">
          {events.map(ev => (
            <div key={ev._id} className="card p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                {ev.images?.[0] && (
                  <img src={ev.images[0]} alt={ev.title} className="w-full sm:w-28 h-24 object-cover rounded-xl flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <Link to={`/events/${ev._id}`} className="text-white font-semibold hover:text-primary-300">{ev.title}</Link>
                      <p className="text-gray-400 text-xs mt-0.5">by {ev.organizer?.name} · {ev.organizer?.email}</p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[ev.status] || ''}`}>{ev.status}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-2">
                    <div><p className="text-xs text-gray-500">Date</p><p className="text-gray-200">{format(new Date(ev.date), 'MMM d, yyyy')}</p></div>
                    <div><p className="text-xs text-gray-500">Location</p><p className="text-gray-200 truncate">{ev.location?.city}, {ev.location?.state}</p></div>
                    <div><p className="text-xs text-gray-500">Price</p><p className="text-gray-200">{ev.price === 0 ? 'FREE' : `₹${ev.price}`}</p></div>
                    <div><p className="text-xs text-gray-500">Seats</p><p className="text-gray-200">{ev.totalSeats}</p></div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {ev.status !== 'approved' && (
                      <button onClick={() => handleStatus(ev._id, 'approved')} disabled={actionLoading === ev._id + 'approved'}
                        className="text-xs border border-green-500/30 px-4 py-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors">
                        ✓ Approve
                      </button>
                    )}
                    {ev.status !== 'rejected' && (
                      <button onClick={() => handleStatus(ev._id, 'rejected')} disabled={actionLoading === ev._id + 'rejected'}
                        className="text-xs border border-red-500/30 px-4 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                        ✗ Reject
                      </button>
                    )}
                    <Link to={`/events/${ev._id}`} className="text-xs border border-white/10 px-4 py-1.5 rounded-lg text-gray-400 hover:text-white transition-colors">Preview</Link>
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
