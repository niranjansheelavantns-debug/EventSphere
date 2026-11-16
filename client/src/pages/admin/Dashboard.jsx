import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getAdminStats } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const StatCard = ({ label, value, icon, color }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-3">
      <p className="text-gray-400 text-sm">{label}</p>
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</span>
    </div>
    <p className="text-3xl font-bold text-white">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const { stats, recentBookings = [], topEvents = [] } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="text-gray-400">Platform overview and analytics</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/events" className="btn-secondary text-sm py-2 px-4">Event Approvals</Link>
          <Link to="/admin/users" className="btn-primary text-sm py-2 px-4">Manage Users</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} icon="👤" color="bg-blue-500/20" />
        <StatCard label="Organizers" value={stats?.totalOrganizers || 0} icon="🎪" color="bg-purple-500/20" />
        <StatCard label="Total Events" value={stats?.totalEvents || 0} icon="📅" color="bg-green-500/20" />
        <StatCard label="Confirmed Bookings" value={stats?.totalBookings || 0} icon="🎟️" color="bg-orange-500/20" />
        <StatCard label="Pending Approval" value={stats?.pendingEvents || 0} icon="⏳" color="bg-yellow-500/20" />
        <StatCard label="Approved Events" value={stats?.approvedEvents || 0} icon="✅" color="bg-green-500/20" />
        <StatCard label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="bg-primary-500/20" />
        <StatCard label="Avg per Booking" value={stats?.totalBookings ? `₹${Math.round((stats?.totalRevenue || 0) / stats.totalBookings)}` : '—'} icon="📊" color="bg-accent-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold">Recent Bookings</h3>
            <span className="text-gray-400 text-xs">{recentBookings.length} shown</span>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-gray-400 p-5 text-sm">No bookings yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {recentBookings.map(b => (
                <div key={b._id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{b.user?.name}</p>
                    <p className="text-gray-400 text-xs">{b.event?.title} · {b.event?.date ? format(new Date(b.event.date), 'MMM d') : ''}</p>
                  </div>
                  <span className="text-primary-400 font-semibold text-sm">{b.totalAmount === 0 ? 'FREE' : `₹${b.totalAmount}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Events */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="text-white font-semibold">Top Events by Bookings</h3>
          </div>
          {topEvents.length === 0 ? (
            <p className="text-gray-400 p-5 text-sm">No data yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {topEvents.map((item, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-4">
                  <span className="text-2xl font-bold text-white/20 w-8 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.event?.title}</p>
                    <p className="text-gray-400 text-xs">{item.totalBookings} bookings</p>
                  </div>
                  <span className="text-primary-400 font-semibold text-sm">₹{(item.totalRevenue || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
