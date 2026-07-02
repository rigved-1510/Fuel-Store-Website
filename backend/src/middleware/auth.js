import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import pool from '../config/db.js';

/**
 * Extracts and verifies the JWT from the Authorization header.
 * Attaches the authenticated user object (without password_hash) to req.user.
 */
export const verifyToken = catchAsync(async (req, _res, next) => {
  // 1. Extract token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Let the error handler deal with JsonWebTokenError / TokenExpiredError
    throw err;
  }

  // 3. Confirm user still exists in DB
  const [rows] = await pool.execute(
    'SELECT id, first_name, last_name, email, phone, role, is_verified, created_at FROM users WHERE id = ?',
    [decoded.id]
  );

  if (rows.length === 0) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  req.user = rows[0];
  next();
});

/**
 * Restricts access to admin users only.
 * Must be used AFTER verifyToken.
 */
export function isAdmin(req, _res, next) {
  if (req.user.role !== 'admin') {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }
  next();
}
