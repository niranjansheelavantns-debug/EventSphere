import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedEvents, getUpcomingEvents } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { label: 'Music', value: 'music', icon: '🎵' },
  { label: 'Tech', value: 'tech', icon: '💻' },
  { label: 'Sports', value: 'sports', icon: '⚽' },
  { label: 'Food', value: 'food', icon: '🍜' },
  { label: 'Arts', value: 'arts', icon: '🎨' },
  { label: 'Business', value: 'business', icon: '💼' },
];

const STATS = [
  { value: '500+', label: 'Events Hosted' },
  { value: '50K+', label: 'Happy Attendees' },
  { value: '200+', label: 'Organizers' },
  { value: '30+', label: 'Cities' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [f, u] = await Promise.all([getFeaturedEvents(), getUpcomingEvents()]);
        setFeatured(f.data.events || []);
        setUpcoming(u.data.events || []);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/events?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-950 pt-20 pb-32">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 text-primary-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            New events added daily
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Discover Events<br />
            <span className="gradient-text">That Matter</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Find concerts, workshops, sports meets, and more. Book tickets in seconds and create unforgettable memories.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2 mb-12">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, cities, categories..."
                className="input-field pl-12 h-14 text-base"
              />
            </div>
            <button type="submit" className="btn-primary h-14 px-8 text-base">Search</button>
          </form>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                to={`/events?category=${cat.value}`}
                className="flex items-center gap-2 bg-white/5 hover:bg-primary-500/20 border border-white/10 hover:border-primary-500/30 px-5 py-2.5 rounded-full text-sm font-medium text-gray-300 hover:text-primary-300 transition-all duration-200"
              >
                <span>{cat.icon}</span>{cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-600/10 border-y border-primary-500/10 py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Featured Events */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {featured.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="section-title">✨ Featured Events</h2>
                    <p className="text-gray-400 text-sm">Hand-picked experiences you'll love</p>
                  </div>
                  <Link to="/events?featured=true" className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.slice(0, 6).map((e) => <EventCard key={e._id} event={e} />)}
                </div>
              </section>
            )}

            {upcoming.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="section-title">📅 Upcoming Events</h2>
                    <p className="text-gray-400 text-sm">Don't miss what's happening soon</p>
                  </div>
                  <Link to="/events" className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {upcoming.slice(0, 8).map((e) => <EventCard key={e._id} event={e} compact />)}
                </div>
              </section>
            )}

            {featured.length === 0 && upcoming.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
                <p className="text-gray-400 mb-6">Be the first to create an amazing event!</p>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 p-10 md:p-14 text-center">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Host Your Own Event</h2>
            <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
              Reach thousands of attendees. Our platform makes it easy to create, promote, and manage your events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=organizer" className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
                Start as Organizer
              </Link>
              <Link to="/events" className="btn-secondary">
                Explore Events
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
