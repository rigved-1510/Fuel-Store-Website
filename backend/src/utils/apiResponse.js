/**
 * Standardised API response helpers.
 *
 * Every endpoint MUST use these so the frontend always receives:
 *   Success → { success: true,  message, data }
 *   Error   → { success: false, message, errors? }
 */

export function sendSuccess(res, statusCode, message, data = null) {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
}

export function sendError(res, statusCode, message, errors = null) {
  const payload = { success: false, message };
  if (errors !== null) payload.errors = errors;
  return res.status(statusCode).json(payload);
}
