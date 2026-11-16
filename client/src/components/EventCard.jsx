import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  music: 'bg-pink-500/20 text-pink-300',
  sports: 'bg-green-500/20 text-green-300',
  tech: 'bg-blue-500/20 text-blue-300',
  business: 'bg-yellow-500/20 text-yellow-300',
  arts: 'bg-purple-500/20 text-purple-300',
  food: 'bg-orange-500/20 text-orange-300',
  education: 'bg-cyan-500/20 text-cyan-300',
  other: 'bg-gray-500/20 text-gray-300',
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80';

export default function EventCard({ event, compact = false }) {
  const { _id, title, date, time, location, price, images, category, availableSeats, totalSeats } = event;
  const imgSrc = images?.[0] || PLACEHOLDER;
  const seatsPercent = Math.round(((totalSeats - availableSeats) / totalSeats) * 100);
  const isSoldOut = availableSeats === 0;
  const isAlmostFull = seatsPercent >= 80 && !isSoldOut;

  return (
    <Link to={`/events/${_id}`} className="group block">
      <div className="card overflow-hidden hover:border-primary-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10">
        {/* Image */}
        <div className={`relative overflow-hidden ${compact ? 'h-40' : 'h-52'}`}>
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`badge ${CATEGORY_COLORS[category] || CATEGORY_COLORS.other}`}>
              {category?.charAt(0).toUpperCase() + category?.slice(1)}
            </span>
            {isSoldOut && <span className="badge bg-red-500/20 text-red-300">Sold Out</span>}
            {isAlmostFull && <span className="badge bg-orange-500/20 text-orange-300">Almost Full</span>}
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="bg-gray-900/80 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-lg">
              {price === 0 ? 'FREE' : `₹${price.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-base leading-snug mb-3 line-clamp-2 group-hover:text-primary-300 transition-colors">
            {title}
          </h3>

          <div className="space-y-1.5 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{date ? format(new Date(date), 'EEE, MMM d, yyyy') : '—'} · {time}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{location?.city}, {location?.state}</span>
            </div>
          </div>

          {!compact && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{availableSeats} seats left</span>
                <span>{seatsPercent}% filled</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isSoldOut ? 'bg-red-500' : seatsPercent >= 80 ? 'bg-orange-500' : 'bg-primary-500'}`}
                  style={{ width: `${seatsPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
