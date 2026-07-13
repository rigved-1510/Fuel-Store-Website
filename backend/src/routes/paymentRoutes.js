import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { verifyToken } from '../middleware/auth.js';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController.js';

const router = Router();

// ─── VALIDATION RULES ────────────────────────────────────────────────

const createOrderRules = [
  body('addressId')
    .notEmpty().withMessage('Shipping address ID is required.')
    .isInt({ gt: 0 }).withMessage('Address ID must be a positive integer.'),
];

const verifyPaymentRules = [
  body('razorpay_payment_id')
    .notEmpty().withMessage('razorpay_payment_id is required.')
    .isString().trim(),

  body('razorpay_order_id')
    .notEmpty().withMessage('razorpay_order_id is required.')
    .isString().trim(),

  body('razorpay_signature')
    .notEmpty().withMessage('razorpay_signature is required.')
    .isString().trim(),

  body('addressId')
    .notEmpty().withMessage('Shipping address ID is required.')
    .isInt({ gt: 0 }).withMessage('Address ID must be a positive integer.'),
];

// ─── ROUTES ──────────────────────────────────────────────────────────

// Step 1: Create a Razorpay order (no DB order created yet)
router.post('/create-order', verifyToken, createOrderRules, validate, createRazorpayOrder);

// Step 2: Verify payment signature, then create DB order + clear cart + reduce stock
router.post('/verify', verifyToken, verifyPaymentRules, validate, verifyPayment);

export default router;
