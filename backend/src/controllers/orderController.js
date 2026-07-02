import { OrderModel } from '../models/orderModel.js';
import { CartModel } from '../models/cartModel.js';
import { AddressModel } from '../models/addressModel.js';
import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';

// ─── HELPERS ──────────────────────────────────────────────────────────

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
const VALID_PAYMENT_METHODS = ['COD', 'UPI', 'Razorpay', 'Stripe'];

function calcTotals(items) {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shippingCharge = subtotal === 0 || subtotal >= 1500 ? 0 : 150;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  return { subtotal, shippingCharge, tax, total: subtotal + shippingCharge + tax };
}

// ─── PLACE ORDER ──────────────────────────────────────────────────────
export const placeOrder = catchAsync(async (req, res) => {
  const { addressId, paymentMethod } = req.body;

  if (!addressId) throw new AppError('A shipping address is required.', 400);
  if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new AppError(`Payment method must be one of: ${VALID_PAYMENT_METHODS.join(', ')}.`, 400);
  }

  // 1. Validate shipping address belongs to user
  const address = await AddressModel.findById(addressId);
  if (!address) throw new AppError('Shipping address not found.', 404);
  if (address.userId !== req.user.id) throw new AppError('Access denied to this address.', 403);

  // 2. Get cart
  const cartId = await CartModel.getOrCreateCart(req.user.id);
  const cartItems = await CartModel.getCartItems(req.user.id);
  if (cartItems.length === 0) throw new AppError('Your cart is empty. Please add items before placing an order.', 400);

  // 3. Enrich cart items with size ID and product meta for the transaction
  const enrichedItems = [];
  for (const ci of cartItems) {
    // Fetch size_id from cart_items directly
    const [ciRows] = await pool.execute(
      'SELECT ci.size_id, s.name as size_name FROM cart_items ci JOIN sizes s ON s.id = ci.size_id WHERE ci.id = ?',
      [ci.id]
    );
    if (ciRows.length === 0) throw new AppError(`Cart item #${ci.id} is invalid.`, 400);

    // Fetch category name for snapshot
    const [catRows] = await pool.execute(
      'SELECT c.name FROM products p JOIN categories c ON c.id = p.category_id WHERE p.id = ?',
      [ci.productId]
    );

    enrichedItems.push({
      productId: ci.productId,
      productName: ci.product.name,
      productImage: ci.product.image || null,
      club: null,              // already baked into name
      categoryName: catRows[0]?.name || null,
      sizeName: ciRows[0].size_name,
      sizeId: ciRows[0].size_id,
      quantity: ci.quantity,
      unitPrice: ci.product.price
    });
  }

  // 4. Calculate totals
  const { subtotal, shippingCharge, tax, total } = calcTotals(enrichedItems);

  // 5. Place order atomically
  const orderId = await OrderModel.placeOrder({
    userId: req.user.id,
    cartId,
    items: enrichedItems,
    subtotal,
    shippingCharge,
    discount: 0,
    totalAmount: total,
    paymentMethod,
    address: {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || null,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country
    }
  });

  const order = await OrderModel.findById(orderId);
  return sendSuccess(res, 201, 'Order placed successfully.', order);
});

// ─── USER: GET ORDER HISTORY ──────────────────────────────────────────
export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await OrderModel.findByUser(req.user.id);
  return sendSuccess(res, 200, 'Order history fetched successfully.', orders);
});

// ─── USER: GET SINGLE ORDER ───────────────────────────────────────────
export const getMyOrderById = catchAsync(async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) throw new AppError('Order not found.', 404);
  if (order.userId !== req.user.id) throw new AppError('Access denied.', 403);
  return sendSuccess(res, 200, 'Order fetched successfully.', order);
});

// ─── USER: CANCEL OWN ORDER ───────────────────────────────────────────
export const cancelMyOrder = catchAsync(async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) throw new AppError('Order not found.', 404);
  if (order.userId !== req.user.id) throw new AppError('Access denied.', 403);

  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    throw new AppError(`Cannot cancel an order with status "${order.orderStatus}".`, 400);
  }

  await OrderModel.cancelOrder(req.params.id);
  const updated = await OrderModel.findById(req.params.id);
  return sendSuccess(res, 200, 'Order cancelled successfully.', updated);
});

// ─── ADMIN: GET ALL ORDERS ────────────────────────────────────────────
export const getAllOrders = catchAsync(async (req, res) => {
  const { status, paymentStatus, limit, offset } = req.query;

  if (status && !VALID_ORDER_STATUSES.includes(status)) {
    throw new AppError(`Invalid order status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}.`, 400);
  }
  if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    throw new AppError(`Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}.`, 400);
  }

  const orders = await OrderModel.findAll({ status, paymentStatus, limit: limit || 50, offset: offset || 0 });
  return sendSuccess(res, 200, 'Orders fetched successfully.', orders);
});

// ─── ADMIN: GET SINGLE ORDER ──────────────────────────────────────────
export const getOrderById = catchAsync(async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) throw new AppError('Order not found.', 404);
  return sendSuccess(res, 200, 'Order fetched successfully.', order);
});

// ─── ADMIN: UPDATE ORDER STATUS ───────────────────────────────────────
export const updateOrderStatus = catchAsync(async (req, res) => {
  const { orderStatus, paymentStatus, transactionId } = req.body;

  if (orderStatus && !VALID_ORDER_STATUSES.includes(orderStatus)) {
    throw new AppError(`Invalid order status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}.`, 400);
  }
  if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    throw new AppError(`Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(', ')}.`, 400);
  }

  const order = await OrderModel.findById(req.params.id);
  if (!order) throw new AppError('Order not found.', 404);

  // If admin is cancelling, use the full cancel+restock logic
  if (orderStatus === 'cancelled' && order.orderStatus !== 'cancelled') {
    await OrderModel.cancelOrder(req.params.id);
    // Also update payment status if provided
    if (paymentStatus || transactionId) {
      await OrderModel.updateStatus(req.params.id, { paymentStatus, transactionId });
    }
  } else {
    await OrderModel.updateStatus(req.params.id, { orderStatus, paymentStatus, transactionId });
  }

  const updated = await OrderModel.findById(req.params.id);
  return sendSuccess(res, 200, 'Order updated successfully.', updated);
});
