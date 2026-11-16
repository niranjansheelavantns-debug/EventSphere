import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { getMyEvents, getEventBookings } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BookingOverview() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get('eventId') || '');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    getMyEvents().then(({ data }) => { setEvents(data.events || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEvent) { setBookings([]); return; }
    setLoadingBookings(true);
    getEventBookings(selectedEvent)
      .then(({ data }) => { setBookings(data.bookings || []); })
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  }, [selectedEvent]);

  if (loading) return <LoadingSpinner fullScreen />;

  const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.totalAmount, 0);
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-8">Booking Overview</h1>

      <div className="card p-5 mb-6">
        <label className="block text-sm text-gray-300 mb-2">Select Event</label>
        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="input-field">
          <option value="" className="bg-gray-900">-- Choose an event --</option>
          {events.map(ev => <option key={ev._id} value={ev._id} className="bg-gray-900">{ev.title}</option>)}
        </select>
      </div>

      {selectedEvent && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Bookings', value: bookings.length },
              { label: 'Confirmed', value: confirmedCount },
              { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}` },
            ].map(s => (
              <div key={s.label} className="card p-5 text-center">
                <p className="text-2xl font-bold gradient-text">{s.value}</p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {loadingBookings ? <LoadingSpinner /> : bookings.length === 0 ? (
            <div className="card p-10 text-center text-gray-400">No bookings yet for this event.</div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10">
                    <tr className="text-left text-gray-400 text-xs">
                      {['Booking ID', 'Attendee', 'Email', 'Seats', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map(b => (
                      <tr key={b._id} className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-primary-400">{b.bookingId}</td>
                        <td className="px-4 py-3 text-white">{b.user?.name || '—'}</td>
                        <td className="px-4 py-3 text-gray-400">{b.user?.email || '—'}</td>
                        <td className="px-4 py-3 text-white">{b.seatsBooked}</td>
                        <td className="px-4 py-3 text-white">{b.totalAmount === 0 ? 'FREE' : `₹${b.totalAmount}`}</td>
                        <td className="px-4 py-3">
                          <span className={`badge text-xs ${b.status === 'confirmed' ? 'bg-green-500/20 text-green-300' : b.status === 'cancelled' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{b.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{format(new Date(b.createdAt), 'MMM d, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
