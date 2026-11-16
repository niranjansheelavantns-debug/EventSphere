// Footer.jsx
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-bold gradient-text">EventSphere</Link>
            <p className="text-gray-400 mt-3 text-sm leading-relaxed max-w-xs">
              The ultimate platform to discover, create, and book amazing events near you.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/events" className="hover:text-white transition-colors">Browse Events</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/events/create" className="hover:text-white transition-colors">Host an Event</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Music', 'Tech', 'Sports', 'Food', 'Arts', 'Business'].map(c => (
                <li key={c}><Link to={`/events?category=${c.toLowerCase()}`} className="hover:text-white transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-8 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} EventSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
