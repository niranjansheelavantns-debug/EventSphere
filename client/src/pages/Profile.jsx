import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateProfile, changePassword } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setChangingPw(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    setChangingPw(false);
  };

  const ROLE_COLORS = { admin: 'bg-red-500/20 text-red-300', organizer: 'bg-purple-500/20 text-purple-300', user: 'bg-blue-500/20 text-blue-300' };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="section-title mb-8">My Profile</h1>

      {/* Avatar Card */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className={`badge mt-2 ${ROLE_COLORS[user?.role] || ''}`}>{user?.role}</span>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>
        <form onSubmit={handleProfile} className="space-y-4">
          <div><label className="block text-sm text-gray-300 mb-1.5">Full Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm text-gray-300 mb-1.5">Phone</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm text-gray-300 mb-1.5">Email</label>
            <input value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" /></div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <form onSubmit={handlePassword} className="space-y-4">
          <div><label className="block text-sm text-gray-300 mb-1.5">Current Password</label>
            <input type="password" required value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm text-gray-300 mb-1.5">New Password</label>
            <input type="password" required value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm text-gray-300 mb-1.5">Confirm New Password</label>
            <input type="password" required value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} className="input-field" /></div>
          <button type="submit" disabled={changingPw} className="btn-primary">{changingPw ? 'Changing...' : 'Change Password'}</button>
        </form>
      </div>
    </div>
  );
}
