import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { OAuth2Client } from 'google-auth-library';

const SALT_ROUNDS = 12;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate a JWT for a given user.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Format user data for API responses (strip internal fields).
 */
function formatUser(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone || null,
    role: user.role,
    provider: user.provider,
    avatar: user.avatar,
    isVerified: user.is_verified,
    createdAt: user.created_at,
  };
}

// ─── SIGNUP ──────────────────────────────────────────────────────────
export const signup = catchAsync(async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Check if email already exists
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const userId = await UserModel.create({
    firstName,
    lastName,
    email,
    passwordHash,
    phone: phone || null,
  });

  // Fetch created user
  const user = await UserModel.findById(userId);
  const token = signToken(user);

  return sendSuccess(res, 201, 'Account created successfully.', {
    user: formatUser(user),
    token,
  });
});

// ─── LOGIN ───────────────────────────────────────────────────────────
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user (includes password_hash)
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Google accounts cannot login using password
  if (user.provider === 'google') {
    throw new AppError(
      'This account uses Google Sign-In. Please continue with Google.',
      401
    );
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken(user);

  return sendSuccess(res, 200, 'Login successful.', {
    user: formatUser(user),
    token,
  });
});
export const googleLogin = catchAsync(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
      throw new AppError('Google credential is required.', 400);
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';
    const avatar = payload.picture || '';

    // 1. Check if Google account already exists
    let user = await UserModel.findByGoogleId(googleId);

    // 2. If not, check for existing email account
    if (!user) {
      user = await UserModel.findByEmail(email);

      if (user) {
        // Link Google account
        await UserModel.linkGoogleAccount(
          user.id,
          googleId,
          avatar
        );

        user = await UserModel.findById(user.id);
      } else {
        // Create new Google user
        const userId = await UserModel.createGoogleUser({
          firstName,
          lastName,
          email,
          googleId,
          avatar,
        });

        user = await UserModel.findById(userId);
      }
    }

    const token = signToken(user);

    return sendSuccess(
      res,
      200,
      'Google login successful.',
      {
        user: formatUser(user),
        token,
      }
    );
  });

// ─── GET PROFILE ─────────────────────────────────────────────────────
export const getProfile = catchAsync(async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return sendSuccess(res, 200, 'Profile fetched successfully.', {
    user: formatUser(user),
  });
});

// ─── UPDATE PROFILE ──────────────────────────────────────────────────
export const updateProfile = catchAsync(async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;

  // If email is being changed, check it's not already taken by another user
  if (email && email !== req.user.email) {
    const existing = await UserModel.findByEmail(email);
    if (existing && existing.id !== req.user.id) {
      throw new AppError('This email is already in use by another account.', 409);
    }
  }

  await UserModel.updateProfile(req.user.id, {
    firstName: firstName || req.user.first_name,
    lastName: lastName || req.user.last_name,
    email: email || req.user.email,
    phone: phone !== undefined ? phone : req.user.phone,
  });

  const updatedUser = await UserModel.findById(req.user.id);

  return sendSuccess(res, 200, 'Profile updated successfully.', {
    user: formatUser(updatedUser),
  });
});

// ─── CHANGE PASSWORD ─────────────────────────────────────────────────
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get current password hash from DB
  const currentHash = await UserModel.getPasswordHash(req.user.id);
  if (!currentHash) {
    throw new AppError('User not found.', 404);
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, currentHash);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 401);
  }

  // Hash and save new password
  const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await UserModel.updatePassword(req.user.id, newHash);

  // Issue a fresh token so the user stays logged in
  const user = await UserModel.findById(req.user.id);
  const token = signToken(user);

  return sendSuccess(res, 200, 'Password changed successfully.', { token });
});

// ─── LOGOUT ──────────────────────────────────────────────────────────
// JWT is stateless — real invalidation requires a token blacklist (Redis).
// For now, we respond with success and the frontend clears the stored token.
export const logout = catchAsync(async (_req, res) => {
  return sendSuccess(res, 200, 'Logged out successfully.');
});

// ─── ADMIN: GET ALL USERS ────────────────────────────────────────────
export const getAllUsers = catchAsync(async (_req, res) => {
  const users = await UserModel.findAll();
  return sendSuccess(res, 200, 'Users fetched successfully.', users.map(formatUser));
});
