import { CartModel } from '../models/cartModel.js';
import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Calculates cart summary totals.
 */
function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Alignment with React frontend currency scale (Rs vs Dollars)
  // If subtotal is scaled to Rs (e.g. >= 1500), shipping is free, else 150.
  const shippingThreshold = 1500;
  const shippingCost = 150;
  
  const shipping = subtotal === 0 || subtotal >= shippingThreshold ? 0 : shippingCost;
  const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
  const total = subtotal + shipping + tax;

  return {
    subtotal,
    shipping,
    tax,
    total
  };
}

// ─── GET CART ────────────────────────────────────────────────────────
export const getCart = catchAsync(async (req, res) => {
  await CartModel.getOrCreateCart(req.user.id);
  const items = await CartModel.getCartItems(req.user.id);
  const totals = calculateTotals(items);

  return sendSuccess(res, 200, 'Cart fetched successfully.', {
    items,
    ...totals
  });
});

// ─── ADD TO CART ─────────────────────────────────────────────────────
export const addToCart = catchAsync(async (req, res) => {
  const { productId, size, quantity } = req.body;
  const qty = parseInt(quantity, 10);

  if (!productId || !size || isNaN(qty) || qty <= 0) {
    throw new AppError('Product ID, size, and a positive quantity are required.', 400);
  }

  // 1. Resolve size ID
  const [dbSizes] = await pool.execute('SELECT id FROM sizes WHERE LOWER(name) = ?', [size.toLowerCase()]);
  if (dbSizes.length === 0) {
    throw new AppError(`Size "${size}" is invalid.`, 400);
  }
  const sizeId = dbSizes[0].id;

  // 2. Validate stock availability
  const [dbProductSizes] = await pool.execute(
    'SELECT stock FROM product_sizes WHERE product_id = ? AND size_id = ?',
    [productId, sizeId]
  );
  if (dbProductSizes.length === 0) {
    throw new AppError('This product does not come in the requested size.', 400);
  }
  const availableStock = dbProductSizes[0].stock;

  // 3. Get user's cart ID
  const cartId = await CartModel.getOrCreateCart(req.user.id);

  // 4. Calculate total requested quantity (existing in cart + new request)
  const existingItem = await CartModel.findItem(cartId, productId, sizeId);
  const totalRequested = (existingItem ? existingItem.quantity : 0) + qty;

  if (totalRequested > availableStock) {
    throw new AppError(`Cannot add to cart. Only ${availableStock} unit(s) of this size are in stock.`, 400);
  }

  // 5. Add/Update item
  await CartModel.addItem(cartId, productId, sizeId, qty);

  // Return updated cart
  const items = await CartModel.getCartItems(req.user.id);
  const totals = calculateTotals(items);

  return sendSuccess(res, 200, 'Product added to cart.', {
    items,
    ...totals
  });
});

// ─── UPDATE ITEM QUANTITY ────────────────────────────────────────────
export const updateCartItem = catchAsync(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const qty = parseInt(quantity, 10);

  if (isNaN(qty) || qty <= 0) {
    throw new AppError('A positive quantity is required.', 400);
  }

  // 1. Verify item exists
  const item = await CartModel.findItemById(itemId);
  if (!item) {
    throw new AppError('Cart item not found.', 404);
  }

  // 2. Authorize ownership
  const cartId = await CartModel.getOrCreateCart(req.user.id);
  if (item.cart_id !== cartId) {
    throw new AppError('Unauthorized access to this cart item.', 403);
  }

  // 3. Check stock constraints
  const [dbProductSizes] = await pool.execute(
    'SELECT stock FROM product_sizes WHERE product_id = ? AND size_id = ?',
    [item.product_id, item.size_id]
  );
  if (dbProductSizes.length === 0) {
    throw new AppError('This product size is no longer available.', 400);
  }
  const availableStock = dbProductSizes[0].stock;

  if (qty > availableStock) {
    throw new AppError(`Cannot update quantity. Only ${availableStock} unit(s) are in stock.`, 400);
  }

  // 4. Perform update
  await CartModel.updateItemQuantity(itemId, qty);

  // Return updated cart
  const items = await CartModel.getCartItems(req.user.id);
  const totals = calculateTotals(items);

  return sendSuccess(res, 200, 'Cart quantity updated.', {
    items,
    ...totals
  });
});

// ─── REMOVE ITEM ─────────────────────────────────────────────────────
export const removeCartItem = catchAsync(async (req, res) => {
  const { itemId } = req.params;

  // 1. Verify item exists
  const item = await CartModel.findItemById(itemId);
  if (!item) {
    throw new AppError('Cart item not found.', 404);
  }

  // 2. Authorize ownership
  const cartId = await CartModel.getOrCreateCart(req.user.id);
  if (item.cart_id !== cartId) {
    throw new AppError('Unauthorized access to this cart item.', 403);
  }

  // 3. Remove
  await CartModel.removeItem(itemId);

  // Return updated cart
  const items = await CartModel.getCartItems(req.user.id);
  const totals = calculateTotals(items);

  return sendSuccess(res, 200, 'Item removed from cart.', {
    items,
    ...totals
  });
});

// ─── CLEAR CART ──────────────────────────────────────────────────────
export const clearCart = catchAsync(async (req, res) => {
  const cartId = await CartModel.getOrCreateCart(req.user.id);
  await CartModel.clearCart(cartId);

  return sendSuccess(res, 200, 'Cart cleared successfully.', {
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });
});
