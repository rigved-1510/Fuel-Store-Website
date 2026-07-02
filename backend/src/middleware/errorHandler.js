import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Centralized error-handling middleware.
 * Express recognises it as an error handler because it has 4 parameters.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with this value already exists.';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // Log unexpected (non-operational) errors
  if (!(err instanceof AppError)) {
    logger.error('Unexpected error:', err.stack || err);
  }

  // In production, hide internal error details
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong. Please try again later.';
  }

  return sendError(res, statusCode, message);
}
