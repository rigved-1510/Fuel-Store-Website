import crypto from 'crypto';
import { OrderModel } from '../models/orderModel.js';
import { CartModel } from '../models/cartModel.js';
import { AddressModel } from '../models/addressModel.js';
import pool from '../config/db.js';
import razorpayInstance from '../services/razorpayService.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';

// ─── HELPERS ──────────────────────────────────────────────────────────

/**
 * Calculate order totals from enriched cart items (server-side only).
 * Never use values from the frontend.
 */
function calcTotals(items) {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shippingCharge = subtotal === 0 || subtotal >= 1500 ? 0 : 150;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  return { subtotal, shippingCharge, tax, total: subtotal + shippingCharge + tax };
}

/**
 * Fetch and enrich cart items with size_id and category from DB.
 * Returns an array ready for calcTotals() and OrderModel.placeOrder().
 */
async function getEnrichedCartItems(userId) {
  const cartItems = await CartModel.getCartItems(userId);
  if (cartItems.length === 0) {
    throw new AppError('Your cart is empty. Please add items before placing an order.', 400);
  }

  const enrichedItems = [];
  for (const ci of cartItems) {
    const [ciRows] = await pool.execute(
      'SELECT ci.size_id, s.name as size_name FROM cart_items ci JOIN sizes s ON s.id = ci.size_id WHERE ci.id = ?',
      [ci.id]
    );
    if (ciRows.length === 0) throw new AppError(`Cart item #${ci.id} is invalid.`, 400);

    const [catRows] = await pool.execute(
      'SELECT c.name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?',
      [ci.productId]
    );

    enrichedItems.push({
      productId: ci.productId,
      productName: ci.product.name,
      productImage: ci.product.image || null,
      club: null,
      categoryName: catRows[0]?.name || null,
      sizeName: ciRows[0].size_name,
      sizeId: ciRows[0].size_id,
      quantity: ci.quantity,
      unitPrice: ci.product.price,
    });
  }

  return enrichedItems;
}

// ─── CREATE RAZORPAY ORDER ─────────────────────────────────────────────────
/**
 * POST /api/payments/create-order
 *
 * 1. Authenticates user
 * 2. Validates address ownership
 * 3. Reads cart & calculates totals from DB (never trust frontend)
 * 4. Creates a Razorpay order
 * 5. Returns Razorpay order details to the frontend
 *
 * NOTE: No database order is created here — that only happens after
 *       payment signature is successfully verified.
 */
export const createRazorpayOrder = catchAsync(async (req, res) => {
  const { addressId } = req.body;

  if (!addressId) throw new AppError('A shipping address is required.', 400);

  // Validate address belongs to the authenticated user
  const address = await AddressModel.findById(addressId);
  if (!address) throw new AppError('Shipping address not found.', 404);
  if (address.userId !== req.user.id) throw new AppError('Access denied to this address.', 403);

  // Get enriched cart items and calculate totals from DB
  const enrichedItems = await getEnrichedCartItems(req.user.id);
  const { total } = calcTotals(enrichedItems);

  // Razorpay requires amount in paise (INR × 100), as an integer
  const amountInPaise = Math.round(total * 100);

  const receipt = `rcpt_${req.user.id}_${Date.now()}`;

  const razorpayOrder = await razorpayInstance.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt,
  });

  return sendSuccess(res, 200, 'Razorpay order created successfully.', {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// ─── VERIFY PAYMENT & PLACE ORDER ─────────────────────────────────────────
/**
 * POST /api/payments/verify
 *
 * 1. Receives razorpay_payment_id, razorpay_order_id, razorpay_signature
 * 2. Verifies HMAC-SHA256 signature using RAZORPAY_KEY_SECRET
 * 3. Only on successful verification:
 *    - Saves the order to the database
 *    - Saves order items
 *    - Reduces stock
 *    - Clears the cart
 * 4. On verification failure:
 *    - Returns 400 error
 *    - Does NOT modify the database
 */
export const verifyPayment = catchAsync(async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    addressId,
  } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    throw new AppError('Missing payment verification fields.', 400);
  }
  if (!addressId) throw new AppError('A shipping address is required.', 400);

  // ── Step 1: Verify Razorpay signature ───────────────────────────────────
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new AppError('Payment verification failed. Invalid signature.', 400);
  }

  // ── Step 2: Signature valid — now create the order in DB ────────────────

  // Validate address belongs to the authenticated user
  const address = await AddressModel.findById(addressId);
  if (!address) throw new AppError('Shipping address not found.', 404);
  if (address.userId !== req.user.id) throw new AppError('Access denied to this address.', 403);

  // Re-fetch and re-calculate from DB (source of truth)
  const cartId = await CartModel.getOrCreateCart(req.user.id);
  const enrichedItems = await getEnrichedCartItems(req.user.id);
  const { subtotal, shippingCharge, tax, total } = calcTotals(enrichedItems);

  // Place order atomically (creates order, reduces stock, clears cart)
  const orderId = await OrderModel.placeOrder({
    userId: req.user.id,
    cartId,
    items: enrichedItems,
    subtotal,
    shippingCharge,
    discount: 0,
    totalAmount: total,
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    address: {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || null,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    },
  });

  const order = await OrderModel.findById(orderId);
  return sendSuccess(res, 201, 'Payment verified and order placed successfully.', order);
});
