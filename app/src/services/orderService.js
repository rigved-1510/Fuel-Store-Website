import { apiFetch } from './api';

/**
 * GET /api/orders/my
 * Returns the authenticated user's order history.
 */
export async function getMyOrders() {
  const res = await apiFetch('/orders/my');
  return res.data; // array of order objects
}

/**
 * GET /api/orders/my/:id
 */
export async function getMyOrderById(id) {
  const res = await apiFetch(`/orders/my/${id}`);
  return res.data;
}

/**
 * POST /api/orders
 * @param {object} payload - { addressId, paymentMethod }
 * Returns the created order object.
 */
export async function placeOrder({ addressId, paymentMethod }) {
  const res = await apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify({ addressId, paymentMethod }),
  });
  return res.data;
}

/**
 * PATCH /api/orders/my/:id/cancel
 */
export async function cancelOrder(id) {
  const res = await apiFetch(`/orders/my/${id}/cancel`, { method: 'PATCH' });
  return res.data;
}
