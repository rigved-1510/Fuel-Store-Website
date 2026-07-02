import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminOrderDetail, updateOrderStatus } from '../../services/adminService';
import { getImageUrl } from '../../utils/getImageUrl';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

export function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Form edit states
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  async function loadOrderDetails() {
    try {
      setLoading(true);
      const data = await getAdminOrderDetail(id);
      setOrder(data);
      setOrderStatus(data.orderStatus);
      setPaymentStatus(data.paymentStatus);
      setTransactionId(data.transactionId || '');
    } catch (err) {
      setError(err.message || 'Failed to load order detail records.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (updating) return;

    setError(null);
    setUpdating(true);

    try {
      const data = await updateOrderStatus(id, {
        orderStatus,
        paymentStatus,
        transactionId: transactionId || null
      });
      setOrder(data);
      alert('Order status updated successfully!');
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Fetching order files...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex flex-col items-center gap-3">
        <span className="material-icons text-3xl">error_outline</span>
        <p className="font-medium">{error}</p>
        <Link to="/admin/orders" className="text-amber-500 hover:underline text-sm font-semibold">Back to Orders</Link>
      </div>
    );
  }

  const date = new Date(order.orderedAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Breadcrumb / Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
          <Link to="/admin/orders" className="hover:text-amber-500 transition">Orders</Link>
          <span className="material-icons text-[12px]">chevron_right</span>
          <span className="text-slate-300">Order #{order.id}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide">Order Details</h1>
            <p className="text-slate-400 text-sm mt-1">Placed on {date}</p>
          </div>
          <div className="flex gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full ${
              order.orderStatus === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25' :
              order.orderStatus === 'shipped' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
              order.orderStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
              order.orderStatus === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/25' :
              'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              ORDER: {order.orderStatus.toUpperCase()}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full ${
              order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
              order.paymentStatus === 'refunded' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25' :
              order.paymentStatus === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/25' :
              'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              PAYMENT: {order.paymentStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Order Details & Address Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Items & Shipping */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-white font-bold text-base border-b border-slate-850 pb-3 flex items-center gap-2">
              <span className="material-icons text-amber-500 text-sm">shopping_bag</span>
              <span>Items Summary ({order.items.length})</span>
            </h3>
            <div className="divide-y divide-slate-850">
              {order.items.map((item) => {
                return (
                  <div key={item.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={getImageUrl(item.productImage)}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-xl border border-slate-800 bg-slate-950"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/100x100/1e293b/94a3b8?text=Jersey';
                        }}
                      />
                      <div className="leading-tight">
                        <span className="font-semibold text-white block text-sm">{item.productName}</span>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                          <span>SIZE: {item.sizeName}</span>
                          <span>QTY: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white block">₹{parseFloat(item.totalPrice).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-500 font-semibold block mt-1">₹{item.unitPrice} each</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address snapshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-white font-bold text-base border-b border-slate-850 pb-3 flex items-center gap-2">
              <span className="material-icons text-amber-500 text-sm">local_shipping</span>
              <span>Shipping Address</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">RECIPIENT</span>
                <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
                <p className="text-slate-400 font-medium text-xs mt-1">{order.shippingAddress.phone}</p>
              </div>
              <div className="space-y-1 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">DELIVERY ADDRESS</span>
                <p className="text-slate-300 font-semibold text-xs leading-relaxed">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                </p>
                <p className="text-slate-400 font-semibold text-xs mt-1">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </p>
                <p className="text-slate-500 font-bold text-[10px] mt-1.5 uppercase tracking-wide">
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Totals, Actions */}
        <div className="space-y-8">
          {/* Bill Totals Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-white font-bold text-base border-b border-slate-850 pb-3 flex items-center gap-2">
              <span className="material-icons text-amber-500 text-sm">receipt</span>
              <span>Payment Details</span>
            </h3>
            <div className="space-y-2.5 text-sm font-medium text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-slate-200">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Cost:</span>
                <span className="text-slate-200">{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promo Discount:</span>
                  <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-850 pt-2 text-base font-black">
                <span className="text-white">Total Amount:</span>
                <span className="text-amber-500">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="border-t border-slate-850 pt-4 space-y-2 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>PAYMENT METHOD:</span>
                <span className="text-white uppercase tracking-wider">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>TRANSACTION ID:</span>
                <span className="text-white font-mono">{order.transactionId || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Admin status editor form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-white font-bold text-base border-b border-slate-850 pb-3 flex items-center gap-2">
              <span className="material-icons text-amber-500 text-sm">edit_note</span>
              <span>Manage Order Status</span>
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Order Status */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 font-semibold text-xs tracking-wide">ORDER STATUS</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-200 rounded-xl outline-none text-xs cursor-pointer transition appearance-none"
                >
                  {ORDER_STATUSES.map(s => (
                    <option key={s} value={s}>{s.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Payment Status */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 font-semibold text-xs tracking-wide">PAYMENT STATUS</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-200 rounded-xl outline-none text-xs cursor-pointer transition appearance-none"
                >
                  {PAYMENT_STATUSES.map(s => (
                    <option key={s} value={s}>{s.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Transaction ID */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 font-semibold text-xs tracking-wide">TRANSACTION ID</label>
                <input
                  type="text"
                  placeholder="e.g. TXN_UPI_1234"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-200 rounded-xl outline-none text-xs font-mono transition"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 py-3 rounded-xl font-bold tracking-wide transition shadow-lg shadow-amber-500/10 text-xs disabled:opacity-50"
              >
                {updating ? 'Updating Status...' : 'Save Adjustments'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
