import { apiFetch } from './api';

/**
 * GET /api/cart
 * Returns { items, subtotal, shipping, tax, total }
 */
export async function getCart() {
  const res = await apiFetch('/cart');
  return res.data; // { items, subtotal, shipping, tax, total }
}

/**
 * POST /api/cart/items
 * @param {number} productId
 * @param {string} size  - e.g. "M"
 * @param {number} quantity
 * Returns updated cart: { items, subtotal, shipping, tax, total }
 */
export async function addCartItem(productId, size, quantity) {
  const res = await apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, size, quantity }),
  });
  return res.data;
}

/**
 * PUT /api/cart/items/:itemId
 * @param {number} itemId  - cart_items row ID
 * @param {number} quantity
 * Returns updated cart.
 */
export async function updateCartItem(itemId, quantity) {
  const res = await apiFetch(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
  return res.data;
}

/**
 * DELETE /api/cart/items/:itemId
 * Returns updated cart.
 */
export async function removeCartItem(itemId) {
  const res = await apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' });
  return res.data;
}

/**
 * DELETE /api/cart
 * Clears all cart items for the authenticated user.
 */
export async function clearCartOnServer() {
  const res = await apiFetch('/cart', { method: 'DELETE' });
  return res.data;
}
