import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { verifyToken } from '../middleware/auth.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from '../controllers/wishlistController.js';

const router = Router();

// Apply JWT verification middleware to all wishlist actions
router.use(verifyToken);

// ─── VALIDATION RULES ────────────────────────────────────────────────

const addToWishlistRules = [
  body('productId')
    .notEmpty().withMessage('Product ID is required.')
    .isInt().withMessage('Product ID must be an integer.')
];

// ─── ROUTES ──────────────────────────────────────────────────────────

router.get('/', getWishlist);
router.post('/items', addToWishlistRules, validate, addToWishlist);
router.delete('/items/:productId', removeFromWishlist);

export default router;
