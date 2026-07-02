import { apiFetch } from './api';

/**
 * GET /api/addresses
 * Returns array of address objects for the authenticated user.
 */
export async function getAddresses() {
  const res = await apiFetch('/addresses');
  return res.data;
}

/**
 * POST /api/addresses
 * @param {object} addressData - { fullName, phone, addressLine1, addressLine2?, city, state, postalCode, country?, isDefault? }
 */
export async function createAddress(addressData) {
  const res = await apiFetch('/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData),
  });
  return res.data;
}

/**
 * PUT /api/addresses/:id
 */
export async function updateAddress(id, addressData) {
  const res = await apiFetch(`/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(addressData),
  });
  return res.data;
}

/**
 * PATCH /api/addresses/:id/default
 */
export async function setDefaultAddress(id) {
  const res = await apiFetch(`/addresses/${id}/default`, { method: 'PATCH' });
  return res.data;
}

/**
 * DELETE /api/addresses/:id
 */
export async function deleteAddress(id) {
  const res = await apiFetch(`/addresses/${id}`, { method: 'DELETE' });
  return res.data;
}
