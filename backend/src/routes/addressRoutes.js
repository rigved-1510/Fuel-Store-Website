import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { verifyToken } from '../middleware/auth.js';
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress
} from '../controllers/addressController.js';

const router = Router();

// All address routes require authentication
router.use(verifyToken);

// ─── VALIDATION RULES ────────────────────────────────────────────────

const addressRules = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required.')
    .isLength({ max: 100 }).withMessage('Full name must be under 100 characters.'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required.')
    .isMobilePhone('any').withMessage('Please provide a valid phone number.'),

  body('addressLine1')
    .trim()
    .notEmpty().withMessage('Address line 1 is required.')
    .isLength({ max: 255 }).withMessage('Address line 1 must be under 255 characters.'),

  body('addressLine2')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 255 }).withMessage('Address line 2 must be under 255 characters.'),

  body('city')
    .trim()
    .notEmpty().withMessage('City is required.'),

  body('state')
    .trim()
    .notEmpty().withMessage('State is required.'),

  body('postalCode')
    .trim()
    .notEmpty().withMessage('Postal code is required.')
    .isPostalCode('IN').withMessage('Please provide a valid postal code.'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Country must be under 100 characters.'),

  body('isDefault')
    .optional()
    .isBoolean().withMessage('isDefault must be a boolean.')
];

const updateAddressRules = [
  body('fullName').optional().trim().isLength({ max: 100 }).withMessage('Full name must be under 100 characters.'),
  body('phone').optional().trim().isMobilePhone('any').withMessage('Please provide a valid phone number.'),
  body('addressLine1').optional().trim().isLength({ max: 255 }).withMessage('Address line 1 must be under 255 characters.'),
  body('addressLine2').optional({ values: 'falsy' }).trim().isLength({ max: 255 }).withMessage('Address line 2 must be under 255 characters.'),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('postalCode').optional().trim().isPostalCode('IN').withMessage('Please provide a valid postal code.'),
  body('country').optional().trim().isLength({ max: 100 }).withMessage('Country must be under 100 characters.'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean.')
];

// ─── ROUTES ──────────────────────────────────────────────────────────

router.get('/', getAddresses);
router.get('/:id', getAddressById);
router.post('/', addressRules, validate, createAddress);
router.put('/:id', updateAddressRules, validate, updateAddress);
router.patch('/:id/default', setDefaultAddress);
router.delete('/:id', deleteAddress);

export default router;
