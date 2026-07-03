import { ProductModel } from '../models/productModel.js';
import { ImageService } from '../services/imageService.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';

// ─── PUBLIC CONTROLLERS ──────────────────────────────────────────────

export const getAllProducts = catchAsync(async (req, res) => {
  const { category, club, search, maxPrice, featured } = req.query;

  const products = await ProductModel.findAll({
    category,
    club,
    search,
    maxPrice,
    featured: featured !== undefined ? featured === 'true' || featured === '1' : undefined,
    isActive: req.query.admin === 'true' ? undefined : 1
  });

  return sendSuccess(res, 200, 'Products fetched successfully.', products);
});

export const getProductBySlug = catchAsync(async (req, res) => {
  const { slug } = req.params;

  // Fetch the product regardless of active state first (to detect 404 vs inactive)
  const [rows] = await (await import('../config/db.js')).default.execute(
    'SELECT id, is_active FROM products WHERE slug = ?',
    [slug]
  );

  if (rows.length === 0) {
    throw new AppError('Product not found.', 404);
  }

  // For customers: inactive products are invisible (return 404)
  if (!rows[0].is_active) {
    throw new AppError('Product not found.', 404);
  }

  const product = await ProductModel.findById(rows[0].id);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  return sendSuccess(res, 200, 'Product details fetched successfully.', product);
});

// ─── ADMIN CONTROLLERS ───────────────────────────────────────────────

export const createProduct = catchAsync(async (req, res) => {
  const {
    name,
    slug,
    club,
    league,
    season,
    categoryId,
    description,
    price,
    discountPercent,
    featured,
    isActive,
    sizes
  } = req.body;

  // Process uploaded images
  let imagePaths = [];
  if (req.files && req.files.length > 0) {
    imagePaths = await ImageService.uploadImages(req.files);
  } else if (req.body.images) {
    // Fallback if images are passed as string/array of URLs
    imagePaths = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  }

  // Parse sizes (Multipart fields are stringified)
  let parsedSizes = [];
  if (sizes) {
    try {
      parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    } catch (e) {
      throw new AppError('Invalid sizes format. Must be a valid JSON array.', 400);
    }
  }

  const productId = await ProductModel.create({
    name,
    slug,
    club,
    league: league || null,
    season: season || null,
    categoryId: parseInt(categoryId, 10),
    description,
    price: parseFloat(price),
    discountPercent: discountPercent ? parseFloat(discountPercent) : 0,
    featured: featured === 'true' || featured === '1' || featured === 1 ? 1 : 0,
    isActive: isActive === 'false' || isActive === '0' || isActive === 0 ? 0 : 1,
    sizes: parsedSizes,
    images: imagePaths
  });

  const newProduct = await ProductModel.findById(productId);

  return sendSuccess(res, 201, 'Product created successfully.', newProduct);
});

export const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id, 10);

  const existingProduct = await ProductModel.findById(productId);
  if (!existingProduct) {
    throw new AppError('Product not found.', 404);
  }

  const {
    name,
    slug,
    club,
    league,
    season,
    categoryId,
    description,
    price,
    discountPercent,
    featured,
    isActive,
    sizes
  } = req.body;

  // Process images
  let imagePaths = existingProduct.images; // Keep existing if none uploaded
  if (req.files && req.files.length > 0) {
    // Delete old images from disk if they were local paths
    for (const oldImg of existingProduct.images) {
      await ImageService.deleteImage(oldImg);
    }
    imagePaths = await ImageService.uploadImages(req.files);
  } else if (req.body.images !== undefined) {
    imagePaths = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  }

  // Parse sizes
  let parsedSizes;
  if (sizes !== undefined) {
    try {
      parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    } catch (e) {
      throw new AppError('Invalid sizes format. Must be a valid JSON array.', 400);
    }
  }

  await ProductModel.update(productId, {
    name: name !== undefined ? name : existingProduct.name,
    slug: slug !== undefined ? slug : existingProduct.slug,
    club: club !== undefined ? club : existingProduct.club,
    league: league !== undefined ? league : existingProduct.league,
    season: season !== undefined ? season : existingProduct.season,
    categoryId: categoryId !== undefined ? parseInt(categoryId, 10) : existingProduct.categoryId,
    description: description !== undefined ? description : existingProduct.description,
    price: price !== undefined ? parseFloat(price) : existingProduct.price,
    discountPercent: discountPercent !== undefined ? parseFloat(discountPercent) : existingProduct.discountPercent,
    featured: featured !== undefined ? (featured === 'true' || featured === '1' || featured === 1 ? 1 : 0) : (existingProduct.featured ? 1 : 0),
    isActive: isActive !== undefined ? (isActive === 'false' || isActive === '0' || isActive === 0 ? 0 : 1) : (existingProduct.isActive ? 1 : 0),
    sizes: parsedSizes,
    images: imagePaths
  });

  const updatedProduct = await ProductModel.findById(productId);

  return sendSuccess(res, 200, 'Product updated successfully.', updatedProduct);
});

export const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id, 10);

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  // Soft-delete: set is_active = FALSE instead of removing the row.
  // This preserves foreign key references in order_items.
  await ProductModel.delete(productId);

  return sendSuccess(res, 200, 'Product deactivated successfully.');
});

export const activateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id, 10);

  // findAll with isActive: undefined so we can find even inactive products
  const products = await ProductModel.findAll({ isActive: undefined });
  const product = products.find(p => p.id === productId);

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  await ProductModel.activate(productId);

  return sendSuccess(res, 200, 'Product activated successfully.');
});
