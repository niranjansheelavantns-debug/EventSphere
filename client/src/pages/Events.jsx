import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEvents } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['music', 'sports', 'tech', 'business', 'arts', 'food', 'education', 'other'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Date (Earliest)', value: 'date' },
  { label: 'Price (Low → High)', value: 'price' },
  { label: 'Price (High → Low)', value: '-price' },
];

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
  });
  const [inputSearch, setInputSearch] = useState(filters.search);

  const LIMIT = 12;

  const fetchEvents = useCallback(async (f = filters, p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT, sort: f.sort };
      if (f.search) params.search = f.search;
      if (f.category) params.category = f.category;
      if (f.city) params.city = f.city;
      if (f.minPrice) params.minPrice = f.minPrice;
      if (f.maxPrice) params.maxPrice = f.maxPrice;
      const { data } = await getEvents(params);
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const updateFilter = (key, val) => {
    const updated = { ...filters, [key]: val };
    setFilters(updated);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('search', inputSearch);
  };

  const clearFilters = () => {
    const reset = { search: '', category: '', city: '', minPrice: '', maxPrice: '', sort: '-createdAt' };
    setFilters(reset);
    setInputSearch('');
    setPage(1);
    setSearchParams({});
  };

  const pages = Math.ceil(total / LIMIT);
  const hasFilters = filters.search || filters.category || filters.city || filters.minPrice || filters.maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="section-title">Browse Events</h1>
        <p className="text-gray-400">{total} event{total !== 1 ? 's' : ''} found</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            placeholder="Search events..."
            className="input-field pl-12"
          />
        </div>
        <button type="submit" className="btn-primary px-6">Search</button>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="btn-secondary px-4 text-sm">Clear</button>
        )}
      </form>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="card p-5 space-y-6 sticky top-20">
            <div>
              <h3 className="text-white font-semibold mb-3">Category</h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.category ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  All Categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize ${filters.category === cat ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">City</h3>
              <input
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                placeholder="Enter city..."
                className="input-field text-sm"
              />
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Price Range (₹)</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  placeholder="Min"
                  className="input-field text-sm"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  placeholder="Max"
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Sort By</h3>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="input-field text-sm"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Events Grid */}
        <div className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : events.length === 0 ? (
            <div className="text-center py-20 card">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {events.map((event) => <EventCard key={event._id} event={event} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
                  >← Prev</button>
                  {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-primary-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >{p}</button>
                  ))}
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(p => p + 1)}
                    className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
                  >Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
