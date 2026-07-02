import { apiFetch } from './api';

/**
 * POST /api/auth/login
 * Returns { user, token } on success.
 */
export async function loginUser(email, password) {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  // Backend shape: { success, message, data: { user, token } }
  return { user: res.data.user, token: res.data.token };
}

/**
 * POST /api/auth/signup
 * Backend expects: firstName, lastName, email, password, phone (optional)
 * Returns { user, token } on success.
 */
export async function signupUser({ firstName, lastName, email, password, phone }) {
  const res = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password, phone }),
  });
  return { user: res.data.user, token: res.data.token };
}

/**
 * GET /api/auth/profile
 * Backend shape: { success, data: { user: { id, firstName, ... } } }
 * Returns the user object directly.
 */
export async function getProfile() {
  const res = await apiFetch('/auth/profile');
  // res.data = { user: {...} }  — unwrap one level
  return res.data.user;
}

/**
 * PUT /api/auth/profile
 * Backend shape: { success, data: { user: { id, firstName, ... } } }
 * Returns the updated user object directly.
 */
export async function updateProfile({ firstName, lastName, phone }) {
  const res = await apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ firstName, lastName, phone }),
  });
  // res.data = { user: {...} }  — unwrap so callers get the user object
  return res.data.user;
}

/**
 * PUT /api/auth/change-password
 */
export async function changePassword({ currentPassword, newPassword }) {
  const res = await apiFetch('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return res.data;
}

/**
 * POST /api/auth/logout
 * JWT is stateless — server just acknowledges; real cleanup is on the client.
 */
export async function logoutUser() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (_) {
    // Swallow — client-side cleanup always runs regardless
  }
}

/**
 * POST /api/auth/google
 * Returns { user, token } on success.
 */
export async function googleLoginUser(credential) {
  const res = await apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });

  return {
    user: res.data.user,
    token: res.data.token,
  };
}
