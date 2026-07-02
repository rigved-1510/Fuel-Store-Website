import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOrders } from '../../services/adminService';

const STATUS_FILTERS = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [activeFilter]);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getAdminOrders(activeFilter);
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve orders list.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Retrieving customer orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-wide">Orders</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor shipments, change payment states, and view billing details.</p>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
              activeFilter === f.value
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <span className="material-icons">error_outline</span>
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Table grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-icons text-slate-600 text-4xl mb-3">receipt</span>
            <p className="text-slate-400 font-medium">No orders found matching this status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 text-xs font-bold tracking-wider uppercase">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-3">Date</th>
                  <th className="py-4 px-3">Customer</th>
                  <th className="py-4 px-3">Method</th>
                  <th className="py-4 px-3">Amount</th>
                  <th className="py-4 px-3">Order Status</th>
                  <th className="py-4 px-3">Payment</th>
                  <th className="py-4 px-6 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {orders.map((o) => {
                  // Resolve order status colors
                  let oColor = 'bg-slate-800 text-slate-400';
                  if (o.orderStatus === 'confirmed') oColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                  else if (o.orderStatus === 'shipped') oColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                  else if (o.orderStatus === 'delivered') oColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                  else if (o.orderStatus === 'cancelled') oColor = 'bg-red-500/10 text-red-400 border border-red-500/20';

                  // Resolve payment status colors
                  let pColor = 'bg-slate-800 text-slate-400';
                  if (o.paymentStatus === 'paid') pColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                  else if (o.paymentStatus === 'failed') pColor = 'bg-red-500/10 text-red-400 border border-red-500/20';
                  else if (o.paymentStatus === 'refunded') pColor = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';

                  // Date format
                  const date = new Date(o.orderedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={o.id} className="hover:bg-slate-800/20 transition-all">
                      {/* ID */}
                      <td className="py-4 px-6 font-bold text-white">#{o.id}</td>
                      {/* Date */}
                      <td className="py-4 px-3 text-xs font-semibold text-slate-400">{date}</td>
                      {/* Name */}
                      <td className="py-4 px-3">
                        <div className="leading-tight">
                          <span className="font-semibold text-slate-200 block">{o.shippingAddress.fullName}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{o.shippingAddress.phone}</span>
                        </div>
                      </td>
                      {/* Method */}
                      <td className="py-4 px-3 font-semibold text-xs tracking-wider text-slate-300 uppercase">
                        {o.paymentMethod}
                      </td>
                      {/* Amount */}
                      <td className="py-4 px-3 font-bold text-white">
                        ₹{parseFloat(o.totalAmount).toLocaleString('en-IN')}
                      </td>
                      {/* Order Status */}
                      <td className="py-4 px-3">
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${oColor}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      {/* Payment Status */}
                      <td className="py-4 px-3">
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${pColor}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      {/* View Action */}
                      <td className="py-4 px-6 text-center">
                        <Link
                          to={`/admin/orders/${o.id}`}
                          className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition"
                        >
                          <span>Manage</span>
                          <span className="material-icons text-xs">arrow_forward</span>
                        </Link>
                      </td>
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
