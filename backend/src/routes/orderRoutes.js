import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import {
  placeOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/orderController.js';

const router = Router();

// ─── VALIDATION RULES ────────────────────────────────────────────────

const placeOrderRules = [
  body('addressId')
    .notEmpty().withMessage('Shipping address ID is required.')
    .isInt().withMessage('Address ID must be an integer.'),

  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required.')
    .isIn(['COD', 'UPI', 'Razorpay', 'Stripe'])
    .withMessage('Payment method must be one of: COD, UPI, Razorpay, Stripe.')
];

const updateStatusRules = [
  body('orderStatus')
    .optional()
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status.'),

  body('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status.'),

  body('transactionId')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Transaction ID must be under 255 characters.')
];

// ─── USER ROUTES (authenticated) — must come before /:id ─────────────

router.post('/', verifyToken, placeOrderRules, validate, placeOrder);
router.get('/my', verifyToken, getMyOrders);
router.get('/my/:id', verifyToken, getMyOrderById);
router.patch('/my/:id/cancel', verifyToken, cancelMyOrder);

// ─── ADMIN ROUTES — /:id must come after all static segments ──────────

router.get('/', verifyToken, isAdmin, getAllOrders);
router.get('/:id', verifyToken, isAdmin, getOrderById);
router.patch('/:id/status', verifyToken, isAdmin, updateStatusRules, validate, updateOrderStatus);

export default router;
