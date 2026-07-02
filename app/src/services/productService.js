import { apiFetch } from './api';

/**
 * GET /api/products
 * Supported query params: category, club (array), search, maxPrice, featured
 * Returns the product array directly from res.data.
 */
export async function getProducts(filters = {}) {
  const params = new URLSearchParams();

  if (filters.category && filters.category !== 'all') {
    params.set('category', filters.category);
  }
  if (filters.search) {
    params.set('search', filters.search);
  }
  if (filters.maxPrice) {
    params.set('maxPrice', filters.maxPrice);
  }
  if (filters.clubs && filters.clubs.length > 0) {
    // Backend accepts repeated `club` params for multi-value
    filters.clubs.forEach(c => params.append('club', c));
  }
  if (filters.featured) {
    params.set('featured', 'true');
  }

  const qs = params.toString();
  const res = await apiFetch(`/products${qs ? `?${qs}` : ''}`);
  // Backend: { success, data: [...products] }
  return res.data;
}

/**
 * GET /api/products/:slug
 * Returns a single product object.
 */
export async function getProductById(slug) {
  const res = await apiFetch(`/products/${slug}`);
  // Backend: { success, data: product }
  return res.data;
}
