import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getAddresses, createAddress } from '../services/addressService';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/paymentService';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { getImageUrl } from '../utils/getImageUrl';

export function CartPage() {
  const {
    items,
    subtotal,
    shipping,
    tax,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart
  } = useCart();
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'address' | 'payment'
  const [error, setError] = useState('');

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '', phone: '', addressLine1: '', city: '', state: '', postalCode: '', country: 'India'
  });

  // Payment state — UPI is the only active method; COD is disabled
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Fetch addresses when entering checkout step
  useEffect(() => {
    if (checkoutStep === 'address' && isAuthenticated) {
      getAddresses()
        .then(data => {
          setAddresses(data || []);
          if (data && data.length > 0) {
            const def = data.find(a => a.isDefault) || data[0];
            setSelectedAddressId(def.id);
          }
        })
        .catch(err => console.error("Failed to load addresses", err));
    }
  }, [checkoutStep, isAuthenticated]);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setCheckoutStep('address');
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const added = await createAddress(newAddress);
      setAddresses([...addresses, added]);
      setSelectedAddressId(added.id);
      setShowNewAddressForm(false);
    } catch (err) {
      setError(err.message || 'Failed to save address');
    }
  };

  // ── Dynamically load the Razorpay checkout script ──────────────────────
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // ── Handle Place Order (Razorpay flow) ───────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select a shipping address.');
      return;
    }
    setIsCheckingOut(true);
    setError('');

    try {
      // Step 1 — Ask backend to create a Razorpay order (totals computed from DB)
      const { razorpayOrderId, amount, currency, keyId } = await createRazorpayOrder(selectedAddressId);

      // Step 2 — Load Razorpay checkout.js if not already loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please check your internet connection and try again.');
        setIsCheckingOut(false);
        return;
      }

      // Step 3 — Open Razorpay checkout popup
      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'Fuel Store',
        description: 'Football Jersey Order',
        order_id: razorpayOrderId,
        prefill: {
          name: user ? `${user.first_name} ${user.last_name}` : '',
          email: user?.email || '',
        },
        theme: { color: '#e85d04' },

        // Step 4a — Payment successful: verify with backend
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              addressId: selectedAddressId,
            });
            // Verification passed — order is now in DB, cart cleared, stock reduced
            await refreshCart();
            setCheckoutSuccess(true);
          } catch (verifyErr) {
            setError(
              verifyErr.message ||
              'Payment verification failed. Please contact support if your amount was debited.'
            );
          } finally {
            setIsCheckingOut(false);
          }
        },

        // Step 4b — User dismissed the popup
        modal: {
          ondismiss: () => {
            setError('Payment was cancelled. Your cart is intact — you can try again.');
            setIsCheckingOut(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment errors from Razorpay (e.g. bank declines)
      rzp.on('payment.failed', (response) => {
        setError(
          response.error?.description ||
          'Payment failed. Please try again with a different payment method.'
        );
        setIsCheckingOut(false);
      });

      rzp.open();
    } catch (err) {
      // createRazorpayOrder failed (network, auth, empty cart, etc.)
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setIsCheckingOut(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="max-w-md mx-auto my-xl px-margin-mobile text-center py-xl bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-xl animate-fade-in-up">
        <div className="w-20 h-20 bg-secondary/15 rounded-full flex items-center justify-center mx-auto mb-lg">
          <Icon name="check_circle" className="text-secondary text-5xl fill-1 animate-bounce" />
        </div>
        <h3 className="text-headline-md font-headline-md text-primary mb-sm uppercase tracking-tight">Order Placed!</h3>
        
        <Button
          onClick={() => navigate('/products')}
          variant="secondary"
          className="w-full py-md"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-xl px-margin-mobile text-center py-xl bg-surface-container-low border border-dashed border-outline-variant rounded-2xl animate-fade-in-up">
        <Icon name="shopping_cart_off" className="text-5xl text-on-surface-variant mb-md" />
        <h3 className="text-headline-sm font-headline-sm mb-xs">Your Cart is Empty</h3>
        <Button onClick={() => navigate('/products')} variant="outline" className="mt-md">
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-md">
      <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg text-primary mb-lg tracking-tight uppercase">
        {checkoutStep === 'cart' ? 'Shopping Cart' : 'Checkout'}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg lg:items-start">
        
        {/* Left Column: Cart Items or Checkout Flow (8 cols) */}
        <div className="lg:col-span-8 space-y-md">
          
          {checkoutStep === 'cart' && items.map((item) => (
            <div
              key={`${item.product.id}-${item.size}`}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-md bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-md"
            >
              {/* Product Info Segment */}
              <div className="flex gap-md items-center w-full sm:w-auto">
                <div className="w-20 h-24 bg-surface-container rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-outline-variant/20">
                  <img
                    src={getImageUrl(item.product.image)}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-on-surface text-body-md line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">
                    Size: <span className="font-bold text-secondary uppercase">{item.size}</span>
                  </p>
                  <p className="text-label-md font-bold text-primary sm:hidden mt-1">
                    {formatCurrency(item.product.price)} x {item.quantity}
                  </p>
                </div>
              </div>

              {/* Controls and Price Segment */}
              <div className="flex items-center justify-between sm:justify-end gap-lg w-full sm:w-auto mt-sm sm:mt-0 pt-sm sm:pt-0 border-t border-outline-variant/30 sm:border-0">
                {/* Quantity input */}
                <div className="flex items-center border border-outline-variant rounded-lg p-0.5 bg-surface select-none">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                    className="p-1 hover:text-secondary transition-colors focus:outline-none"
                    aria-label="Decrease quantity"
                  >
                    <Icon name="remove" className="text-[18px]" />
                  </button>
                  <span className="px-3 font-bold text-body-md min-w-[20px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                    className="p-1 hover:text-secondary transition-colors focus:outline-none"
                    aria-label="Increase quantity"
                  >
                    <Icon name="add" className="text-[18px]" />
                  </button>
                </div>

                {/* Desktop item total */}
                <div className="hidden sm:block text-right min-w-[80px]">
                  <p className="font-bold text-primary text-body-md">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {formatCurrency(item.product.price)} each
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.product.id, item.size)}
                  className="flex items-center gap-0.5 text-on-surface-variant hover:text-secondary font-bold text-label-sm border border-transparent hover:border-outline-variant/20 py-1 px-2 rounded-lg transition-colors focus:outline-none"
                  aria-label="Remove item"
                >
                  <Icon name="delete" className="text-[18px]" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            </div>
          ))}

          {/* CHECKOUT FLOW: ADDRESS */}
          {checkoutStep !== 'cart' && (
            <div className="bg-surface-container-lowest p-md border border-outline-variant/30 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-md border-b border-outline-variant/30 pb-xs">
                <h3 className="font-headline-sm text-headline-sm uppercase text-primary">1. Shipping Address</h3>
                <Button variant="outline" size="sm" onClick={() => setCheckoutStep('cart')}>Back to Cart</Button>
              </div>

              {addresses.length > 0 && !showNewAddressForm ? (
                <div className="space-y-sm">
                  {addresses.map(addr => (
                    <div 
                      key={addr.id} 
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-sm border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-secondary bg-secondary/5' : 'border-outline-variant/50 hover:border-outline-variant'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-on-surface">{addr.fullName} <span className="text-on-surface-variant font-normal">({addr.phone})</span></p>
                          <p className="text-label-md text-on-surface-variant mt-1">{addr.addressLine1}</p>
                          {addr.addressLine2 && <p className="text-label-md text-on-surface-variant">{addr.addressLine2}</p>}
                          <p className="text-label-md text-on-surface-variant">{addr.city}, {addr.state} {addr.postalCode}</p>
                        </div>
                        {selectedAddressId === addr.id && <Icon name="check_circle" className="text-secondary" />}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => setShowNewAddressForm(true)} className="mt-sm">
                    + Add New Address
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSaveNewAddress} className="space-y-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    <div>
                      <label className="text-label-sm font-bold text-on-surface-variant">Full Name *</label>
                      <input required type="text" className="w-full bg-surface-container-lowest border border-outline-variant/65 rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary outline-none text-body-md" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-label-sm font-bold text-on-surface-variant">Phone Number *</label>
                      <input required type="tel" className="w-full bg-surface-container-lowest border border-outline-variant/65 rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary outline-none text-body-md" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-label-sm font-bold text-on-surface-variant">Address Line 1 *</label>
                      <input required type="text" className="w-full bg-surface-container-lowest border border-outline-variant/65 rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary outline-none text-body-md" value={newAddress.addressLine1} onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-label-sm font-bold text-on-surface-variant">City *</label>
                      <input required type="text" className="w-full bg-surface-container-lowest border border-outline-variant/65 rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary outline-none text-body-md" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-label-sm font-bold text-on-surface-variant">State *</label>
                      <input required type="text" className="w-full bg-surface-container-lowest border border-outline-variant/65 rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary outline-none text-body-md" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-label-sm font-bold text-on-surface-variant">Postal Code *</label>
                      <input required type="text" className="w-full bg-surface-container-lowest border border-outline-variant/65 rounded-lg px-md py-sm focus:ring-2 focus:ring-secondary outline-none text-body-md" value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} />
                    </div>
                  </div>
                  {error && <p className="text-error text-label-sm">{error}</p>}
                  <div className="flex gap-sm">
                    <Button type="submit" variant="secondary">Save Address</Button>
                    {addresses.length > 0 && (
                      <Button type="button" variant="outline" onClick={() => setShowNewAddressForm(false)}>Cancel</Button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* CHECKOUT FLOW: PAYMENT */}
          {checkoutStep === 'payment' && (
            <div className="bg-surface-container-lowest p-md border border-outline-variant/30 rounded-xl shadow-sm mt-md">
              <div className="flex justify-between items-center mb-md border-b border-outline-variant/30 pb-xs">
                <h3 className="font-headline-sm text-headline-sm uppercase text-primary">2. Payment Method</h3>
              </div>

              <div className="space-y-sm">

                {/* ── UPI / Razorpay — the only active option ── */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-sm border rounded-lg cursor-pointer transition-colors flex items-center gap-md ${
                    paymentMethod === 'UPI'
                      ? 'border-secondary bg-secondary/5'
                      : 'border-outline-variant/50 hover:border-outline-variant'
                  }`}
                >
                  <Icon name="qr_code" className="text-[24px] text-primary" />
                  <div className="flex-1">
                    <p className="font-bold text-on-surface">UPI / Online Payment</p>
                    <p className="text-label-sm text-on-surface-variant">
                      Pay securely via UPI, Cards, Net Banking &amp; Wallets — powered by Razorpay.
                    </p>
                  </div>
                  {paymentMethod === 'UPI' && <Icon name="check_circle" className="text-secondary ml-auto" />}
                </div>

                {/* ── Cash on Delivery — disabled ── */}
                <div
                  className="p-sm border border-outline-variant/30 rounded-lg flex items-center gap-md opacity-50 cursor-not-allowed select-none bg-surface-container"
                  aria-disabled="true"
                >
                  <Icon name="local_shipping" className="text-[24px] text-on-surface-variant" />
                  <div className="flex-1">
                    <div className="flex items-center gap-sm flex-wrap">
                      <p className="font-bold text-on-surface-variant">Cash on Delivery (COD)</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-error/15 text-error border border-error/30">
                        Currently Unavailable
                      </span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant">Pay when your order arrives.</p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Right Column: Summary (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 mt-lg lg:mt-0">
          <div className="bg-surface-container-low p-lg rounded-xl border border-outline-variant/30 shadow-sm space-y-md">
            <h3 className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary pb-xs border-b border-outline-variant/30">
              Order Summary
            </h3>
            
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Subtotal ({items.length} items)</span>
                <span className="font-semibold text-primary">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Shipping</span>
                {shipping === 0 ? (
                  <span className="font-bold text-secondary uppercase text-label-sm bg-secondary/10 px-2 py-0.5 rounded-full">
                    Free
                  </span>
                ) : (
                  <span className="font-semibold text-primary">{formatCurrency(shipping)}</span>
                )}
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Tax (8%)</span>
                <span className="font-semibold text-primary">{formatCurrency(tax)}</span>
              </div>
            </div>

            <div className="border-t border-outline-variant/40 pt-md mt-md">
              <div className="flex justify-between items-end">
                <span className="font-headline-sm text-headline-sm uppercase text-primary">Total</span>
                <span className="font-headline-md text-headline-md text-secondary font-bold">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {error && checkoutStep !== 'cart' && <p className="text-error text-label-sm text-center">{error}</p>}

            {checkoutStep === 'cart' ? (
              <Button
                onClick={handleProceedToCheckout}
                variant="secondary"
                className="w-full py-4 text-label-md tracking-wider rounded-lg mt-md shadow-md gap-sm"
              >
                PROCEED TO CHECKOUT
                <Icon name="arrow_forward" className="text-[18px]" />
              </Button>
            ) : checkoutStep === 'address' ? (
              <Button
                onClick={() => {
                  if(!selectedAddressId) setError('Please select an address');
                  else { setError(''); setCheckoutStep('payment'); }
                }}
                variant="secondary"
                disabled={!selectedAddressId}
                className="w-full py-4 text-label-md tracking-wider rounded-lg mt-md shadow-md"
              >
                CONTINUE TO PAYMENT
              </Button>
            ) : (
              <Button
                onClick={handlePlaceOrder}
                disabled={isCheckingOut}
                variant="secondary"
                isLoading={isCheckingOut}
                className="w-full py-4 text-label-md tracking-wider rounded-lg mt-md shadow-md gap-sm"
              >
                {!isCheckingOut && 'PLACE ORDER'}
                {isCheckingOut && 'PROCESSING...'}
              </Button>
            )}

            {/* Secure tags */}
            <div className="pt-md border-t border-outline-variant/30 flex flex-col gap-sm items-center">
              <p className="text-[10px] uppercase text-on-surface-variant tracking-wider font-bold">
                Secure Checkout Powered By SSL
              </p>
              <div className="flex justify-center gap-lg grayscale opacity-60 text-on-surface-variant">
                <Icon name="lock" className="text-[28px]" title="SSL Secure" />
                <Icon name="credit_card" className="text-[28px]" title="Major Cards" />
                <Icon name="verified_user" className="text-[28px]" title="Verified" />
              </div>
            </div>
          </div>

          <div className="mt-md p-md bg-surface-container rounded-xl flex items-start gap-sm border border-outline-variant/20 shadow-sm">
            <Icon name="local_shipping" className="text-secondary text-[24px]" />
            <div>
              <p className="text-label-md font-bold uppercase tracking-wider text-on-surface">Fast Delivery</p>
              <p className="text-label-sm text-on-surface-variant">Estimated delivery within 2-4 business days.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
