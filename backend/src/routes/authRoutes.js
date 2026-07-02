import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getAllUsers,
} from '../controllers/authController.js';

const router = Router();

// ─── VALIDATION RULES ────────────────────────────────────────────────

const signupRules = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2–50 characters.'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2–50 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
    .matches(/\d/).withMessage('Password must contain at least one number.'),

  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isMobilePhone('any').withMessage('Please provide a valid phone number.'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

const updateProfileRules = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2–50 characters.'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2–50 characters.'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isMobilePhone('any').withMessage('Please provide a valid phone number.'),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters.')
    .matches(/\d/).withMessage('New password must contain at least one number.')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password.');
      }
      return true;
    }),
];

// ─── ROUTES ──────────────────────────────────────────────────────────

// Public
router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);

// Protected (require valid JWT)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfileRules, validate, updateProfile);
router.put('/change-password', verifyToken, changePasswordRules, validate, changePassword);
router.post('/logout', verifyToken, logout);

// Admin-Only
router.get('/users', verifyToken, isAdmin, getAllUsers);

export default router;
