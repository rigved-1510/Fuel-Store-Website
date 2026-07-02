import { apiFetch } from './api';

/**
 * GET /api/wishlist
 * Returns array of wishlist product objects.
 */
export async function getWishlist() {
  const res = await apiFetch('/wishlist');
  return res.data; // [ { id, name, slug, club, category, price, originalPrice, badge, image } ]
}

/**
 * POST /api/wishlist
 * @param {number} productId
 * Returns updated wishlist array.
 */
export async function addToWishlist(productId) {
  const res = await apiFetch('/wishlist/items', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
  return res.data;
}

/**
 * DELETE /api/wishlist/:productId
 * Returns updated wishlist array.
 */
export async function removeFromWishlist(productId) {
  const res = await apiFetch(`/wishlist/items/${productId}`, { method: 'DELETE' });
  return res.data;
}
