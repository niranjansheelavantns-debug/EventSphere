import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: searchParams.get('role') === 'organizer' ? 'organizer' : 'user',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone });
      loginUser(data.user, data.token);
      toast.success('Welcome to EventSphere! 🎉');
      navigate(data.user.role === 'organizer' ? '/manage-events' : '/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const f = (key, val) => setForm({ ...form, [key]: val });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold gradient-text">EventSphere</Link>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>
        <div className="card p-8">
          <div className="flex rounded-xl overflow-hidden border border-white/10 mb-6">
            {['user', 'organizer'].map((r) => (
              <button key={r} type="button" onClick={() => f('role', r)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.role === r ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                {r === 'user' ? '👤 Attendee' : '🎪 Organizer'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm text-gray-300 mb-1.5">Full Name</label>
              <input required value={form.name} onChange={e => f('name', e.target.value)} placeholder="John Doe" className="input-field" /></div>
            <div><label className="block text-sm text-gray-300 mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={e => f('email', e.target.value)} placeholder="you@example.com" className="input-field" /></div>
            <div><label className="block text-sm text-gray-300 mb-1.5">Phone (optional)</label>
              <input type="tel" value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+91 98765 43210" className="input-field" /></div>
            <div><label className="block text-sm text-gray-300 mb-1.5">Password</label>
              <input type="password" required value={form.password} onChange={e => f('password', e.target.value)} placeholder="Min. 6 characters" className="input-field" /></div>
            <div><label className="block text-sm text-gray-300 mb-1.5">Confirm Password</label>
              <input type="password" required value={form.confirmPassword} onChange={e => f('confirmPassword', e.target.value)} placeholder="Re-enter password" className="input-field" /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
        <p className="text-center text-gray-400 mt-6 text-sm">Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link></p>
      </div>
    </div>
  );
}
