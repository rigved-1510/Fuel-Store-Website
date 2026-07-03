import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { upload } from '../config/multer.js';
import {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  activateProduct
} from '../controllers/productController.js';

const router = Router();

// ─── VALIDATION RULES ────────────────────────────────────────────────

const createProductRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required.')
    .isLength({ max: 255 }).withMessage('Product name cannot exceed 255 characters.'),

  body('slug')
    .trim()
    .notEmpty().withMessage('Product slug/ID is required.')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must consist of lowercase letters, numbers, and hyphens only.'),

  body('club')
    .trim()
    .notEmpty().withMessage('Club name is required.'),

  body('categoryId')
    .notEmpty().withMessage('Category ID is required.')
    .isInt().withMessage('Category ID must be an integer.'),

  body('price')
    .notEmpty().withMessage('Price is required.')
    .isFloat({ min: 0 }).withMessage('Price must be a positive decimal value.'),

  body('discountPercent')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0, max: 100 }).withMessage('Discount percent must be between 0 and 100.'),

  body('description')
    .optional()
    .trim()
];

const updateProductRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Product name cannot exceed 255 characters.'),

  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must consist of lowercase letters, numbers, and hyphens only.'),

  body('club')
    .optional()
    .trim(),

  body('categoryId')
    .optional()
    .isInt().withMessage('Category ID must be an integer.'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive decimal value.'),

  body('discountPercent')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0, max: 100 }).withMessage('Discount percent must be between 0 and 100.'),

  body('description')
    .optional()
    .trim()
];

// ─── ROUTES ──────────────────────────────────────────────────────────

// Public
router.get('/', getAllProducts);
router.get('/:slug', getProductBySlug);

// Admin-Only CRUD
router.post(
  '/',
  verifyToken,
  isAdmin,
  upload.array('images', 5), // Support uploading up to 5 images
  createProductRules,
  validate,
  createProduct
);

router.put(
  '/:id',
  verifyToken,
  isAdmin,
  upload.array('images', 5),
  updateProductRules,
  validate,
  updateProduct
);

router.delete(
  '/:id',
  verifyToken,
  isAdmin,
  deleteProduct
);

// Restore (re-activate) a soft-deleted product — admin only
router.patch(
  '/:id/activate',
  verifyToken,
  isAdmin,
  activateProduct
);

export default router;
