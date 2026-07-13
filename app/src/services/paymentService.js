import { apiFetch } from './api';

/**
 * POST /api/payments/create-order
 *
 * Tells the backend to:
 *  1. Read the user's cart from DB
 *  2. Calculate totals server-side
 *  3. Create a Razorpay order
 *
 * Returns: { razorpayOrderId, amount, currency, keyId }
 *
 * @param {number} addressId - The selected shipping address ID
 */
export async function createRazorpayOrder(addressId) {
  const res = await apiFetch('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ addressId }),
  });
  return res.data;
}

/**
 * POST /api/payments/verify
 *
 * Sends Razorpay payment details to the backend for HMAC-SHA256 verification.
 * Only on successful verification does the backend:
 *  - Create the order in DB
 *  - Reduce stock
 *  - Clear the cart
 *
 * Returns the created order object.
 *
 * @param {object} payload
 * @param {string} payload.razorpay_payment_id
 * @param {string} payload.razorpay_order_id
 * @param {string} payload.razorpay_signature
 * @param {number} payload.addressId
 */
export async function verifyRazorpayPayment({ razorpay_payment_id, razorpay_order_id, razorpay_signature, addressId }) {
  const res = await apiFetch('/payments/verify', {
    method: 'POST',
    body: JSON.stringify({ razorpay_payment_id, razorpay_order_id, razorpay_signature, addressId }),
  });
  return res.data;
}
