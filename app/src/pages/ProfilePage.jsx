import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/orderService';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { formatCurrency } from '../utils/formatCurrency';
import { getImageUrl } from '../utils/getImageUrl';

export function ProfilePage() {
  const { user, logout, isAuthenticated, isLoading, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Settings states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState('');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Fetch orders
  useEffect(() => {
    if (isAuthenticated) {
      getMyOrders()
        .then(data => setOrders(data || []))
        .catch(err => console.error("Failed to load orders", err))
        .finally(() => setIsLoadingOrders(false));
    }
  }, [isAuthenticated]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateFeedback('');

    try {
      await updateProfile({ firstName, lastName, phone });
      setUpdateFeedback('Profile updated successfully!');
      setTimeout(() => setUpdateFeedback(''), 3000);
    } catch (err) {
      setUpdateFeedback(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl text-center">
        <Icon name="sync" className="animate-spin text-5xl text-secondary" />
        <p className="mt-md text-on-surface-variant font-bold">Verifying Session...</p>
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-md min-h-screen">
      
      {/* Upper Profile Hero Dashboard */}
      <section className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-lg md:p-xl shadow-sm mb-lg animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center justify-between gap-lg">
          <div className="flex flex-col md:flex-row items-center gap-md text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xl font-bold uppercase shadow-md select-none border-2 border-white">
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-sm">
                <h2 className="text-headline-md font-bold tracking-tight text-on-surface uppercase">
                  {fullName}
                </h2>
                <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
                  Member
                </span>
              </div>
              <p className="text-body-md text-on-surface-variant mt-xs">{user.email}</p>
              <p className="text-label-sm text-outline mt-1 uppercase font-semibold">
                Member since {new Date(user.createdAt || Date.now()).getFullYear()}
              </p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-xs px-lg py-sm border-outline text-on-surface-variant hover:text-secondary hover:border-secondary shadow-sm"
          >
            <Icon name="logout" className="text-[20px]" />
            Sign Out
          </Button>
        </div>
      </section>

      {/* Grid Dashboard columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
        
        {/* Left Column: Order History (8 cols) */}
        <section className="lg:col-span-8 space-y-md">
          <h3 className="text-headline-sm font-headline-sm uppercase text-primary tracking-tight mb-md flex items-center gap-xs">
            <Icon name="shopping_bag" className="text-secondary" />
            Order History
          </h3>

          {isLoadingOrders ? (
            <div className="text-center py-xl">
              <Icon name="sync" className="animate-spin text-3xl text-secondary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-xl text-center shadow-sm">
              <Icon name="receipt_long" className="text-5xl text-on-surface-variant mb-md" />
              <p className="text-body-md text-on-surface-variant">You haven't placed any orders yet.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card Header info */}
                <div className="bg-surface-container-low/30 px-md py-sm border-b border-outline-variant/30 flex flex-wrap justify-between items-center gap-base text-label-sm">
                  <div className="flex gap-md flex-wrap text-on-surface-variant">
                    <span>Order ID: <strong className="text-primary">#{order.id}</strong></span>
                    <span>Placed on: <strong>{new Date(order.orderedAt).toLocaleDateString()}</strong></span>
                  </div>
                  <span className="font-bold text-secondary-container bg-secondary/10 px-3 py-1 rounded-full uppercase text-[10px] tracking-wider select-none">
                    {order.orderStatus}
                  </span>
                </div>

                {/* Items in order */}
                <div className="p-md divide-y divide-outline-variant/20">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-sm first:pt-0 last:pb-0 flex justify-between items-center text-body-md gap-sm">
                      <div className="flex gap-md items-center">
                        {item.productImage && (
                           <img src={getImageUrl(item.productImage)} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                        )}
                        <div>
                          <h4 className="font-bold text-on-surface">{item.productName}</h4>
                          <p className="text-label-sm text-on-surface-variant mt-0.5">
                            Size: <span className="font-bold uppercase text-secondary">{item.sizeName}</span> | Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-primary">{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Order total footer */}
                <div className="bg-surface-container-low/10 px-md py-sm border-t border-outline-variant/30 flex justify-between items-center text-label-md">
                  <span className="font-bold uppercase tracking-wider text-on-surface-variant">Total Paid</span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Right Column: Settings & Details Edit (4 cols) */}
        <section className="lg:col-span-4 bg-surface-container-low border border-outline-variant/30 rounded-xl p-md shadow-sm space-y-md">
          <h3 className="text-label-md font-bold uppercase tracking-wider text-primary pb-xs border-b border-outline-variant/30 flex items-center gap-xs">
            <Icon name="manage_accounts" className="text-secondary" />
            Account Settings
          </h3>

          {updateFeedback && (
            <div className={`p-xs ${updateFeedback.includes('Failed') ? 'bg-error/10 text-error border-error/20' : 'bg-secondary-container/20 text-secondary border-secondary/20'} rounded-lg text-label-sm font-semibold text-center animate-pulse`}>
              {updateFeedback}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-md">
            <div className="space-y-xs">
              <label className="text-label-sm font-bold text-on-surface-variant" htmlFor="profile-firstname">
                First Name
              </label>
              <input
                type="text"
                id="profile-firstname"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full bg-surface-container-lowest border border-outline-variant/65 rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary outline-none text-body-md transition-shadow"
              />
            </div>
            
            <div className="space-y-xs">
              <label className="text-label-sm font-bold text-on-surface-variant" htmlFor="profile-lastname">
                Last Name
              </label>
              <input
                type="text"
                id="profile-lastname"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full bg-surface-container-lowest border border-outline-variant/65 rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary outline-none text-body-md transition-shadow"
              />
            </div>

            <div className="space-y-xs">
              <label className="text-label-sm font-bold text-on-surface-variant" htmlFor="profile-email">
                Email Address
              </label>
              <input
                type="email"
                id="profile-email"
                disabled
                value={user.email}
                className="w-full bg-surface-container-lowest border border-outline-variant/65 rounded-lg px-md py-sm opacity-60 cursor-not-allowed text-body-md"
              />
              <p className="text-[10px] text-on-surface-variant">Email cannot be changed.</p>
            </div>
            
            <div className="space-y-xs">
              <label className="text-label-sm font-bold text-on-surface-variant" htmlFor="profile-phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="profile-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="w-full bg-surface-container-lowest border border-outline-variant/65 rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary outline-none text-body-md transition-shadow"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              isLoading={isUpdating}
              className="w-full py-3 text-label-sm"
            >
              Update Settings
            </Button>
          </form>
        </section>

      </div>
    </div>
  );
}
