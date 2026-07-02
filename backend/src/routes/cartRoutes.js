import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { verifyToken } from '../middleware/auth.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js';

const router = Router();

// Apply JWT verification middleware to all cart actions
router.use(verifyToken);

// ─── VALIDATION RULES ────────────────────────────────────────────────

const addToCartRules = [
  body('productId')
    .notEmpty().withMessage('Product ID is required.')
    .isInt().withMessage('Product ID must be an integer.'),

  body('size')
    .trim()
    .notEmpty().withMessage('Size name is required.'),

  body('quantity')
    .notEmpty().withMessage('Quantity is required.')
    .isInt({ min: 1 }).withMessage('Quantity must be an integer of at least 1.')
];

const updateCartItemRules = [
  body('quantity')
    .notEmpty().withMessage('Quantity is required.')
    .isInt({ min: 1 }).withMessage('Quantity must be an integer of at least 1.')
];

// ─── ROUTES ──────────────────────────────────────────────────────────

router.get('/', getCart);
router.post('/items', addToCartRules, validate, addToCart);
router.put('/items/:itemId', updateCartItemRules, validate, updateCartItem);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', clearCart);

export default router;
