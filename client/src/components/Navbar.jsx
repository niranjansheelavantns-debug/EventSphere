import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CalendarIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
);

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isOrganizer, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
    setDropOpen(false);
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors duration-200 hover:text-primary-400 ${location.pathname === to ? 'text-primary-400' : 'text-gray-300'}`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-500 transition-colors">
              <CalendarIcon />
            </div>
            <span className="text-xl font-bold gradient-text">EventSphere</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLink('/', 'Home')}
            {navLink('/events', 'Events')}
            {isOrganizer && navLink('/manage-events', 'My Events')}
            {isAdmin && navLink('/admin', 'Admin')}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-200 max-w-[120px] truncate">{user?.name}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 card shadow-2xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                      <span className="badge bg-primary-500/20 text-primary-300 mt-1">{user?.role}</span>
                    </div>
                    <Link to="/profile" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Profile</Link>
                    <Link to="/my-bookings" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">My Bookings</Link>
                    {isOrganizer && <Link to="/events/create" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Create Event</Link>}
                    {isOrganizer && <Link to="/booking-overview" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Bookings Overview</Link>}
                    {isAdmin && <Link to="/admin/users" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Manage Users</Link>}
                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors border-t border-white/10 mt-1">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
            {menuOpen
              ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-1">
            {navLink('/', 'Home')}
            <br />{navLink('/events', 'Events')}
            {isOrganizer && <><br />{navLink('/manage-events', 'My Events')}</>}
            {isAdmin && <><br />{navLink('/admin', 'Admin Dashboard')}</>}
            {isAuthenticated ? (
              <div className="pt-3 border-t border-white/10 mt-3 space-y-1">
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-300">Profile</Link>
                <Link to="/my-bookings" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-300">My Bookings</Link>
                {isOrganizer && <Link to="/events/create" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-300">Create Event</Link>}
                <button onClick={handleLogout} className="block py-2 text-sm text-red-400">Sign Out</button>
              </div>
            ) : (
              <div className="pt-3 border-t border-white/10 mt-3 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-center text-sm">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center text-sm">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
