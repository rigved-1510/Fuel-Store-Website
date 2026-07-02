import pool from '../config/db.js';

export const WishlistModel = {
  /**
   * Find or create a wishlist for the specified user ID.
   */
  async getOrCreateWishlist(userId) {
    const [rows] = await pool.execute('SELECT id FROM wishlist WHERE user_id = ?', [userId]);
    if (rows.length > 0) {
      return rows[0].id;
    }
    
    // Create new wishlist
    const [result] = await pool.execute('INSERT INTO wishlist (user_id) VALUES (?)', [userId]);
    return result.insertId;
  },

  /**
   * Get all items in the user's wishlist along with product and image details.
   */
  async getWishlistItems(userId) {
    const sql = `
      SELECT 
        wi.id, 
        wi.product_id as productId,
        p.name, 
        p.slug, 
        p.price, 
        p.discount_percent as discountPercent,
        p.club,
        c.name as category_name,
        p.league,
        p.featured,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) as image
      FROM wishlist w
      JOIN wishlist_items wi ON w.id = wi.wishlist_id
      JOIN products p ON wi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ?
      ORDER BY wi.created_at DESC
    `;
    const [rows] = await pool.execute(sql, [userId]);
    return rows.map(r => {
      const price = parseFloat(r.price);
      const discount = parseFloat(r.discountPercent);
      
      // Resolve category response
      let categoryResponse = r.category_name.toLowerCase();
      if (categoryResponse === 'jersey' && r.league) {
        categoryResponse = r.league.toLowerCase();
      }

      let badge = null;
      if (discount > 0) badge = 'sale';
      else if (r.featured) badge = 'new';

      return {
        id: r.productId, // Frontend expects product.id as the main item ID on list
        wishlistItemId: r.id, // Keep the row ID for delete
        name: r.name,
        slug: r.slug,
        club: r.club,
        category: categoryResponse,
        price,
        originalPrice: discount > 0 ? Math.round(price / (1 - discount / 100)) : null,
        badge,
        image: r.image || ''
      };
    });
  },

  /**
   * Find a item in the wishlist.
   */
  async findItem(wishlistId, productId) {
    const [rows] = await pool.execute(
      'SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [wishlistId, productId]
    );
    return rows[0] || null;
  },

  /**
   * Add a product to the user's wishlist.
   */
  async addItem(wishlistId, productId) {
    const existing = await this.findItem(wishlistId, productId);
    if (existing) {
      return existing.id;
    }
    const [result] = await pool.execute(
      'INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)',
      [wishlistId, productId]
    );
    return result.insertId;
  },

  /**
   * Remove a single item from the wishlist by the wishlist_items row ID.
   */
  async removeItem(wishlistItemId) {
    const [result] = await pool.execute('DELETE FROM wishlist_items WHERE id = ?', [wishlistItemId]);
    return result.affectedRows > 0;
  },

  /**
   * Remove a product from the user's wishlist by product ID.
   */
  async removeItemByProduct(wishlistId, productId) {
    const [result] = await pool.execute(
      'DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?',
      [wishlistId, productId]
    );
    return result.affectedRows > 0;
  }
};
