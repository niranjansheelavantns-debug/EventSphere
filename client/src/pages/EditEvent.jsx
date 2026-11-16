import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEventById, updateEvent } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['music','sports','tech','business','arts','food','education','other'];

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getEventById(id).then(({ data }) => {
      const e = data.event;
      setForm({
        title: e.title, description: e.description, category: e.category,
        date: e.date?.slice(0, 10), time: e.time, endDate: e.endDate?.slice(0, 10) || '',
        address: e.location?.address, city: e.location?.city, state: e.location?.state || '', country: e.location?.country || 'India',
        price: e.price, totalSeats: e.totalSeats, tags: e.tags?.join(', ') || '',
        refundPolicy: e.refundPolicy || '',
      });
      setLoading(false);
    }).catch(() => { toast.error('Event not found'); navigate('/manage-events'); });
  }, [id, navigate]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      await updateEvent(id, fd);
      toast.success('Event updated! Awaiting re-approval.');
      navigate('/manage-events');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-8">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          ['title', 'Title *', 'text'],
          ['address', 'Address *', 'text'],
          ['city', 'City *', 'text'],
          ['state', 'State', 'text'],
          ['date', 'Date *', 'date'],
          ['time', 'Time *', 'time'],
          ['price', 'Price (₹) *', 'number'],
          ['totalSeats', 'Total Seats *', 'number'],
          ['tags', 'Tags', 'text'],
        ].map(([k, label, type]) => (
          <div key={k}>
            <label className="block text-sm text-gray-300 mb-1.5">{label}</label>
            <input type={type} value={form[k]} onChange={e => f(k, e.target.value)} className="input-field" />
          </div>
        ))}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Category</label>
          <select value={form.category} onChange={e => f('category', e.target.value)} className="input-field capitalize">
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-900 capitalize">{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Description *</label>
          <textarea required value={form.description} onChange={e => f('description', e.target.value)} rows={5} className="input-field resize-none" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Refund Policy</label>
          <textarea value={form.refundPolicy} onChange={e => f('refundPolicy', e.target.value)} rows={2} className="input-field resize-none" />
        </div>
        <div className="flex gap-4 pt-2">
          <button type="submit" disabled={saving} className="btn-primary flex-1 h-12">{saving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" onClick={() => navigate('/manage-events')} className="btn-secondary px-6">Cancel</button>
        </div>
      </form>
    </div>
  );
}
