import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../services/adminService';

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Compiling store analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex flex-col items-center gap-3">
        <span className="material-icons text-3xl">error_outline</span>
        <p className="font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500 text-white font-semibold text-xs tracking-wider px-4 py-2 rounded-xl hover:bg-red-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: 'payments',
      desc: 'Paid and delivered orders value',
      color: 'from-emerald-500/20 to-teal-500/5 border-emerald-500/30 text-emerald-400'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: 'shopping_bag',
      desc: `${stats.pendingOrders} pending orders`,
      color: 'from-amber-500/20 to-yellow-500/5 border-amber-500/30 text-amber-400'
    },
    {
      title: 'Products in Store',
      value: stats.totalProducts,
      icon: 'inventory_2',
      desc: `${stats.activeProducts} active products`,
      color: 'from-blue-500/20 to-indigo-500/5 border-blue-500/30 text-blue-400'
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers,
      icon: 'people',
      desc: 'Registered customers & admins',
      color: 'from-purple-500/20 to-pink-500/5 border-purple-500/30 text-purple-400'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-wide">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time statistics and summary of your online storefront.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${c.color} border p-6 rounded-2xl flex flex-col justify-between h-40 shadow-xl shadow-slate-950/20`}
          >
            <div className="flex justify-between items-start">
              <span className="text-slate-300 font-semibold tracking-wide text-sm">{c.title}</span>
              <span className="material-icons text-2xl opacity-80">{c.icon}</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-white">{c.value}</span>
              <p className="text-slate-400 text-xs mt-1.5 font-medium">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tables layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-white tracking-wide flex items-center gap-2">
              <span className="material-icons text-amber-500 text-lg">local_shipping</span>
              <span>Recent Orders</span>
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-amber-500 hover:text-amber-400 tracking-wider uppercase transition-all"
            >
              View All
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8 font-medium">No orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold tracking-wider uppercase">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {stats.recentOrders.map((o) => {
                    let statusColor = 'bg-slate-800 text-slate-400';
                    if (o.orderStatus === 'confirmed') statusColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                    else if (o.orderStatus === 'shipped') statusColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                    else if (o.orderStatus === 'delivered') statusColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                    else if (o.orderStatus === 'cancelled') statusColor = 'bg-red-500/10 text-red-400 border border-red-500/20';

                    return (
                      <tr key={o.id} className="hover:bg-slate-800/20 transition-all">
                        <td className="py-4 font-semibold text-white">
                          <Link to={`/admin/orders/${o.id}`} className="hover:underline">
                            #{o.id}
                          </Link>
                        </td>
                        <td className="py-4 text-xs font-medium text-slate-300">{o.shippingAddress.fullName}</td>
                        <td className="py-4 font-bold text-white">₹{parseFloat(o.totalAmount).toLocaleString('en-IN')}</td>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColor}`}>
                            {o.orderStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-white tracking-wide flex items-center gap-2">
              <span className="material-icons text-amber-500 text-lg">people</span>
              <span>New Users</span>
            </h3>
            <Link
              to="/admin/users"
              className="text-xs font-bold text-amber-500 hover:text-amber-400 tracking-wider uppercase transition-all"
            >
              View All
            </Link>
          </div>
          {stats.recentUsers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8 font-medium">No users registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold tracking-wider uppercase">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {stats.recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/20 transition-all">
                      <td className="py-4 font-semibold text-white">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="py-4 text-xs font-medium text-slate-400">{u.email}</td>
                      <td className="py-4">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
