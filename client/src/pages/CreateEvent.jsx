import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createEvent } from '../services/api';

const CATEGORIES = ['music','sports','tech','business','arts','food','education','other'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title:'', description:'', category:'other', date:'', time:'', endDate:'',
    address:'', city:'', state:'', country:'India',
    price:'0', totalSeats:'100', tags:'', refundPolicy:'No refunds after booking.',
    lat:'', lng:''
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      await createEvent(fd);
      toast.success('Event submitted for approval!');
      navigate('/manage-events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    }
    setLoading(false);
  };

  const Section = ({ title, children }) => (
    <div className="card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3">{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label, children }) => (
    <div><label className="block text-sm text-gray-300 mb-1.5">{label}</label>{children}</div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="section-title">Create New Event</h1>
        <p className="text-gray-400">Fill in the details. Your event will be reviewed before going live.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Basic Info">
          <Field label="Event Title *">
            <input required value={form.title} onChange={e => f('title', e.target.value)} placeholder="e.g. Tech Summit 2025" className="input-field" />
          </Field>
          <Field label="Description *">
            <textarea required value={form.description} onChange={e => f('description', e.target.value)} placeholder="Describe your event..." rows={5} className="input-field resize-none" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select value={form.category} onChange={e => f('category', e.target.value)} className="input-field capitalize">
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-900 capitalize">{c}</option>)}
              </select>
            </Field>
            <Field label="Tags (comma separated)">
              <input value={form.tags} onChange={e => f('tags', e.target.value)} placeholder="music, outdoor, family" className="input-field" />
            </Field>
          </div>
        </Section>

        <Section title="Date & Time">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Start Date *">
              <input type="date" required value={form.date} onChange={e => f('date', e.target.value)} className="input-field" />
            </Field>
            <Field label="Start Time *">
              <input type="time" required value={form.time} onChange={e => f('time', e.target.value)} className="input-field" />
            </Field>
            <Field label="End Date (optional)">
              <input type="date" value={form.endDate} onChange={e => f('endDate', e.target.value)} className="input-field" />
            </Field>
          </div>
        </Section>

        <Section title="Location">
          <Field label="Address *">
            <input required value={form.address} onChange={e => f('address', e.target.value)} placeholder="Venue name & street" className="input-field" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City *">
              <input required value={form.city} onChange={e => f('city', e.target.value)} placeholder="Mumbai" className="input-field" />
            </Field>
            <Field label="State">
              <input value={form.state} onChange={e => f('state', e.target.value)} placeholder="Maharashtra" className="input-field" />
            </Field>
          </div>
        </Section>

        <Section title="Tickets & Pricing">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ticket Price (₹) *">
              <input type="number" required min="0" value={form.price} onChange={e => f('price', e.target.value)} className="input-field" />
            </Field>
            <Field label="Total Seats *">
              <input type="number" required min="1" value={form.totalSeats} onChange={e => f('totalSeats', e.target.value)} className="input-field" />
            </Field>
          </div>
          <Field label="Refund Policy">
            <textarea value={form.refundPolicy} onChange={e => f('refundPolicy', e.target.value)} rows={2} className="input-field resize-none" />
          </Field>
        </Section>

        <Section title="Event Images (up to 5)">
          <input type="file" multiple accept="image/*" onChange={handleImages} className="text-gray-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white hover:file:bg-primary-500 cursor-pointer w-full" />
          {previews.length > 0 && (
            <div className="flex gap-3 flex-wrap mt-2">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" className="w-24 h-16 object-cover rounded-lg border border-white/10" />
              ))}
            </div>
          )}
        </Section>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex-1 h-12 text-base">
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
          <button type="button" onClick={() => navigate('/manage-events')} className="btn-secondary px-6">Cancel</button>
        </div>
      </form>
    </div>
  );
}
