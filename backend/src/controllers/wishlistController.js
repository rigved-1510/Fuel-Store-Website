import { WishlistModel } from '../models/wishlistModel.js';
import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';

// ─── GET WISHLIST ────────────────────────────────────────────────────
export const getWishlist = catchAsync(async (req, res) => {
  await WishlistModel.getOrCreateWishlist(req.user.id);
  const items = await WishlistModel.getWishlistItems(req.user.id);

  return sendSuccess(res, 200, 'Wishlist fetched successfully.', items);
});

// ─── ADD TO WISHLIST ─────────────────────────────────────────────────
export const addToWishlist = catchAsync(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new AppError('Product ID is required.', 400);
  }

  // 1. Verify product exists
  const [dbProducts] = await pool.execute('SELECT id FROM products WHERE id = ?', [productId]);
  if (dbProducts.length === 0) {
    throw new AppError('Product not found.', 404);
  }

  // 2. Fetch wishlist ID
  const wishlistId = await WishlistModel.getOrCreateWishlist(req.user.id);

  // 3. Add to wishlist
  await WishlistModel.addItem(wishlistId, productId);

  // Return updated list
  const items = await WishlistModel.getWishlistItems(req.user.id);

  return sendSuccess(res, 200, 'Product added to wishlist.', items);
});

// ─── REMOVE FROM WISHLIST ─────────────────────────────────────────────
export const removeFromWishlist = catchAsync(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    throw new AppError('Product ID is required.', 400);
  }

  // 1. Fetch wishlist ID
  const wishlistId = await WishlistModel.getOrCreateWishlist(req.user.id);

  // 2. Remove by product ID (makes frontend integration simple as they toggle via product.id)
  await WishlistModel.removeItemByProduct(wishlistId, productId);

  // Return updated list
  const items = await WishlistModel.getWishlistItems(req.user.id);

  return sendSuccess(res, 200, 'Product removed from wishlist.', items);
});
