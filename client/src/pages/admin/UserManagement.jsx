import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getAdminUsers, blockUser, deleteUser, updateUserRole } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const ROLE_COLORS = { admin:'bg-red-500/20 text-red-300', organizer:'bg-purple-500/20 text-purple-300', user:'bg-blue-500/20 text-blue-300' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers({ search, role: roleFilter });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [search, roleFilter]);

  const handleBlock = async (id) => {
    setActionLoading(id + '_block');
    try {
      const { data } = await blockUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: data.user.isBlocked } : u));
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    setActionLoading(id + '_del');
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    setActionLoading(null);
  };

  const handleRoleChange = async (id, role) => {
    setActionLoading(id + '_role');
    try {
      const { data } = await updateUserRole(id, { role });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: data.user.role } : u));
      toast.success('Role updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActionLoading(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="section-title">User Management</h1>
        <p className="text-gray-400">{total} total users</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field max-w-xs" />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field max-w-xs">
          <option value="" className="bg-gray-900">All Roles</option>
          {['user','organizer','admin'].map(r => <option key={r} value={r} className="bg-gray-900 capitalize">{r}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-left text-gray-400 text-xs">
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.role === 'admin' ? (
                        <span className={`badge ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                      ) : (
                        <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                          disabled={actionLoading === u._id + '_role'}
                          className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300 cursor-pointer">
                          <option value="user" className="bg-gray-900">user</option>
                          <option value="organizer" className="bg-gray-900">organizer</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isBlocked ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleBlock(u._id)} disabled={actionLoading === u._id + '_block'}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${u.isBlocked ? 'border-green-500/30 text-green-400 hover:text-green-300' : 'border-yellow-500/30 text-yellow-400 hover:text-yellow-300'}`}>
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button onClick={() => handleDelete(u._id)} disabled={actionLoading === u._id + '_del'}
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:text-red-300 transition-colors">
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
