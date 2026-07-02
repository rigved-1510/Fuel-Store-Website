import React, { useState, useEffect } from 'react';
import { getAdminUsers } from '../../services/adminService';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve registered users.');
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(term) || u.email.toLowerCase().includes(term) || u.id.toString().includes(term);
  });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Retrieving registered users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-wide">Users</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor registered customer accounts and administrator privileges.</p>
      </div>

      {/* Filter / Search */}
      <div className="flex gap-4 bg-slate-900 p-4 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex-1 relative flex items-center">
          <span className="material-icons text-slate-500 absolute left-4 text-lg">search</span>
          <input
            type="text"
            placeholder="Search users by name, email, or database ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-200 placeholder-slate-500 rounded-xl outline-none text-sm transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <span className="material-icons">error_outline</span>
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Users table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-icons text-slate-600 text-4xl mb-3">people_outline</span>
            <p className="text-slate-400 font-medium">No users match your search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 text-xs font-bold tracking-wider uppercase">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-3">Name</th>
                  <th className="py-4 px-3">Email Address</th>
                  <th className="py-4 px-3">Phone</th>
                  <th className="py-4 px-3">Privileges</th>
                  <th className="py-4 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUsers.map((u) => {
                  const date = new Date(u.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/20 transition-all">
                      {/* ID */}
                      <td className="py-4 px-6 font-semibold text-white">#{u.id}</td>
                      {/* Name */}
                      <td className="py-4 px-3 font-bold text-white">
                        {u.firstName} {u.lastName}
                      </td>
                      {/* Email */}
                      <td className="py-4 px-3 font-medium text-slate-300">{u.email}</td>
                      {/* Phone */}
                      <td className="py-4 px-3 font-semibold text-xs tracking-wider text-slate-400">
                        {u.phone || 'N/A'}
                      </td>
                      {/* Role */}
                      <td className="py-4 px-3">
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            u.role === 'admin'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      {/* Joined Date */}
                      <td className="py-4 px-6 text-xs text-slate-400 font-semibold">{date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
