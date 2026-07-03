import pool from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const ProductModel = {
  /**
   * Find all products matching search and filter conditions.
   * Joins categories to resolve types, and fetches images and sizes in parallel.
   */
  async findAll({ category, club, search, maxPrice, featured, isActive = 1 } = {}) {
    let sql = `
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by isActive
    if (isActive !== undefined) {
      sql += ' AND p.is_active = ?';
      params.push(isActive ? 1 : 0);
    }

    // Filter by featured
    if (featured !== undefined) {
      sql += ' AND p.featured = ?';
      params.push(featured ? 1 : 0);
    }

    // Filter by category or league (Option A mapping)
    if (category && category !== 'all') {
      const leagues = ['premier-league', 'la-liga', 'serie-a', 'bundesliga', 'ligue-1', 'international'];
      if (leagues.includes(category.toLowerCase())) {
        // Filter by products.league column and categories.name = 'Jersey'
        sql += " AND LOWER(p.league) = ? AND LOWER(c.name) = 'jersey'";
        params.push(category.toLowerCase());
      } else if (category.toLowerCase() === 'accessories') {
        sql += " AND LOWER(c.name) = 'accessories'";
      } else if (category.toLowerCase() === 'clothing') {
        sql += " AND LOWER(c.name) = 'clothing'";
      } else {
        // Fallback filter by generic category id or name
        sql += ' AND (p.category_id = ? OR LOWER(c.name) = ?)';
        params.push(category, category.toLowerCase());
      }
    }

    // Filter by clubs (can be a string or an array of clubs)
    if (club) {
      const clubList = Array.isArray(club) ? club : [club];
      if (clubList.length > 0) {
        sql += ` AND p.club IN (${clubList.map(() => '?').join(',')})`;
        params.push(...clubList);
      }
    }

    // Filter by maxPrice
    if (maxPrice !== undefined && maxPrice !== null) {
      sql += ' AND p.price <= ?';
      params.push(parseFloat(maxPrice));
    }

    // Filter by search (name, description, club, league)
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.club LIKE ? OR p.league LIKE ?)';
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild);
    }

    sql += ' ORDER BY p.created_at DESC';

    // Execute query
    const [products] = await pool.execute(sql, params);
    if (products.length === 0) return [];

    // Fetch images and sizes for all retrieved products in batch
    const productIds = products.map(p => p.id);
    const [images] = await pool.query(
      `SELECT product_id, image_url, display_order FROM product_images WHERE product_id IN (${productIds.join(',')}) ORDER BY display_order ASC`
    );
    const [sizes] = await pool.query(
      `SELECT ps.product_id, ps.stock, s.name as size_name
       FROM product_sizes ps
       JOIN sizes s ON ps.size_id = s.id
       WHERE ps.product_id IN (${productIds.join(',')})`
    );

    // Group images and sizes by product ID
    const imagesMap = {};
    images.forEach(img => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_url);
    });

    const sizesMap = {};
    const stockMap = {};
    sizes.forEach(sz => {
      if (!sizesMap[sz.product_id]) sizesMap[sz.product_id] = [];
      sizesMap[sz.product_id].push(sz.size_name);

      if (!stockMap[sz.product_id]) stockMap[sz.product_id] = {};
      stockMap[sz.product_id][sz.size_name] = sz.stock;
    });

    // Map DB objects to the format expected by the frontend
    return products.map(p => {
      const prodImages = imagesMap[p.id] || [];
      const prodSizes = sizesMap[p.id] || [];
      const prodStock = stockMap[p.id] || {};
      const discount = parseFloat(p.discount_percent);
      const price = parseFloat(p.price);

      // Determine category filter value to return to frontend
      let categoryResponse = p.category_name.toLowerCase();
      if (categoryResponse === 'jersey' && p.league) {
        categoryResponse = p.league.toLowerCase();
      }

      // Determine badge value
      let badge = null;
      if (discount > 0) badge = 'sale';
      else if (p.featured) badge = 'new';

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        club: p.club,
        category: categoryResponse,
        categoryId: p.category_id,
        type: categoryResponse === 'accessories' ? 'Official Accessory' : 'Authentic Match Edition',
        price,
        originalPrice: discount > 0 ? Math.round(price / (1 - discount / 100)) : null,
        discountPercent: discount,
        badge,
        sizes: prodSizes,
        stock: prodStock,
        colors: [], // Colors are optional, keep empty
        image: prodImages[0] || '',
        images: prodImages,
        description: p.description,
        features: [
          'Advanced moisture-wicking technology',
          'Ultralight breathable fabric structure',
          'Official club badge and tags'
        ],
        season: p.season,
        league: p.league,
        featured: p.featured === 1,
        isActive: p.is_active === 1
      };
    });
  },

  /**
   * Find a product by its slug (frontend uses product IDs like 'manchester-city-home-2425' as the slug).
   */
  async findBySlug(slug) {
    const [rows] = await pool.execute('SELECT id FROM products WHERE slug = ?', [slug]);
    if (rows.length === 0) return null;
    const products = await this.findAll({ isActive: undefined });
    return products.find(p => p.slug === slug) || null;
  },

  /**
   * Find a product by ID.
   */
  async findById(id) {
    const products = await this.findAll({ isActive: undefined });
    return products.find(p => p.id === id) || null;
  },

  /**
   * Create a new product. Wraps insertions of product, images, and sizes inside a transaction.
   */
  async create({
    name,
    slug,
    club,
    league = null,
    season = null,
    categoryId,
    description,
    price,
    discountPercent = 0,
    featured = 0,
    isActive = 1,
    sizes = [], // Array of { name: 'M', stock: 20 }
    images = [] // Array of image URLs
  }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Insert product details
      const [prodResult] = await conn.execute(
        `INSERT INTO products (name, slug, club, league, season, category_id, description, price, discount_percent, featured, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, slug, club, league, season, categoryId, description, price, discountPercent, featured, isActive]
      );

      const productId = prodResult.insertId;

      // 2. Insert sizes and stock
      if (sizes && sizes.length > 0) {
        for (const sz of sizes) {
          // Resolve size id or insert new
          let sizeId;
          const [existingSize] = await conn.execute('SELECT id FROM sizes WHERE name = ?', [sz.name.toUpperCase()]);
          if (existingSize.length > 0) {
            sizeId = existingSize[0].id;
          } else {
            const [newSize] = await conn.execute('INSERT INTO sizes (name) VALUES (?)', [sz.name.toUpperCase()]);
            sizeId = newSize.insertId;
          }

          // Insert into product_sizes
          const [psResult] = await conn.execute(
            'INSERT INTO product_sizes (product_id, size_id, stock) VALUES (?, ?, ?)',
            [productId, sizeId, sz.stock]
          );

          const productSizeId = psResult.insertId;

          // Create inventory log entry for restock
          await conn.execute(
            'INSERT INTO inventory_logs (product_size_id, quantity_change, reason, remarks) VALUES (?, ?, ?, ?)',
            [productSizeId, sz.stock, 'restock', 'Initial product creation restock']
          );
        }
      }

      // 3. Insert images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await conn.execute(
            'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
            [productId, images[i], i + 1]
          );
        }
      }

      await conn.commit();
      return productId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  /**
   * Update an existing product. Wraps detail modifications and sizes/images syncing inside a transaction.
   */
  async update(id, {
    name,
    slug,
    club,
    league = null,
    season = null,
    categoryId,
    description,
    price,
    discountPercent = 0,
    featured = 0,
    isActive = 1,
    sizes = [], // Array of { name: 'M', stock: 20 }
    images = [] // Array of image URLs
  }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Update product table
      await conn.execute(
        `UPDATE products
         SET name = ?, slug = ?, club = ?, league = ?, season = ?, category_id = ?, description = ?, price = ?, discount_percent = ?, featured = ?, is_active = ?
         WHERE id = ?`,
        [name, slug, club, league, season, categoryId, description, price, discountPercent, featured, isActive, id]
      );

      // 2. Sync sizes
      if (sizes !== undefined) {
        // Fetch existing sizes for comparison
        const [existingSizes] = await conn.execute(
          'SELECT ps.id, ps.stock, s.name FROM product_sizes ps JOIN sizes s ON ps.size_id = s.id WHERE ps.product_id = ?',
          [id]
        );

        const existingMap = {};
        existingSizes.forEach(sz => {
          existingMap[sz.name.toUpperCase()] = sz;
        });

        // Insert / Update requested sizes
        const processedSizeIds = [];
        for (const sz of sizes) {
          const szName = sz.name.toUpperCase();
          // Resolve size id
          let sizeId;
          const [existingSizeDb] = await conn.execute('SELECT id FROM sizes WHERE name = ?', [szName]);
          if (existingSizeDb.length > 0) {
            sizeId = existingSizeDb[0].id;
          } else {
            const [newSizeDb] = await conn.execute('INSERT INTO sizes (name) VALUES (?)', [szName]);
            sizeId = newSizeDb.insertId;
          }

          const existingPs = existingMap[szName];
          if (existingPs) {
            // Update stock and check if inventory log is needed
            const diff = sz.stock - existingPs.stock;
            if (diff !== 0) {
              await conn.execute(
                'UPDATE product_sizes SET stock = ? WHERE id = ?',
                [sz.stock, existingPs.id]
              );
              await conn.execute(
                'INSERT INTO inventory_logs (product_size_id, quantity_change, reason, remarks) VALUES (?, ?, ?, ?)',
                [existingPs.id, diff, 'manual_adjustment', `Stock adjusted from ${existingPs.stock} to ${sz.stock}`]
              );
            }
            processedSizeIds.push(existingPs.id);
          } else {
            // New size mapping
            const [psResult] = await conn.execute(
              'INSERT INTO product_sizes (product_id, size_id, stock) VALUES (?, ?, ?)',
              [id, sizeId, sz.stock]
            );
            const productSizeId = psResult.insertId;
            await conn.execute(
              'INSERT INTO inventory_logs (product_size_id, quantity_change, reason, remarks) VALUES (?, ?, ?, ?)',
              [productSizeId, sz.stock, 'restock', 'Added size to product']
            );
            processedSizeIds.push(productSizeId);
          }
        }

        // Delete sizes not present in requested size list
        const deletedSizes = existingSizes.filter(s => !sizes.some(reqSz => reqSz.name.toUpperCase() === s.name));
        if (deletedSizes.length > 0) {
          await conn.execute(
            `DELETE FROM product_sizes WHERE product_id = ? AND id IN (${deletedSizes.map(s => s.id).join(',')})`,
            [id]
          );
        }
      }

      // 3. Sync images
      if (images !== undefined) {
        // Replace existing images
        await conn.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
        if (images && images.length > 0) {
          for (let i = 0; i < images.length; i++) {
            await conn.execute(
              'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
              [id, images[i], i + 1]
            );
          }
        }
      }

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  /**
   * Soft-delete a product by setting is_active = FALSE.
   * The row is never physically removed so order_items references stay intact.
   */
  async delete(id) {
    const [result] = await pool.execute('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Restore a previously deactivated product by setting is_active = TRUE.
   */
  async activate(id) {
    const [result] = await pool.execute('UPDATE products SET is_active = TRUE WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};
