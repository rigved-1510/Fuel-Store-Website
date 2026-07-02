import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

/**
 * Middleware that checks express-validator results.
 * If validation failed, returns 400 with detailed field errors.
 * Place this AFTER the validation chain in the route definition.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return sendError(res, 400, 'Validation failed.', formattedErrors);
  }

  next();
}
