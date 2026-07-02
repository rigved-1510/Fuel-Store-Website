import pool from '../config/db.js';

export const CartModel = {
  /**
   * Find or create a cart for the specified user ID.
   */
  async getOrCreateCart(userId) {
    const [rows] = await pool.execute('SELECT id FROM cart WHERE user_id = ?', [userId]);
    if (rows.length > 0) {
      return rows[0].id;
    }
    
    // Create new cart
    const [result] = await pool.execute('INSERT INTO cart (user_id) VALUES (?)', [userId]);
    return result.insertId;
  },

  /**
   * Get all items in the user's cart along with product and image details.
   */
  async getCartItems(userId) {
    const sql = `
      SELECT 
        ci.id, 
        ci.product_id as productId, 
        ci.size_id as sizeId, 
        ci.quantity,
        p.name, 
        p.slug, 
        p.price, 
        p.discount_percent as discountPercent,
        s.name as size,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY display_order ASC LIMIT 1) as image
      FROM cart c
      JOIN cart_items ci ON c.id = ci.cart_id
      JOIN products p ON ci.product_id = p.id
      JOIN sizes s ON ci.size_id = s.id
      WHERE c.user_id = ?
      ORDER BY ci.created_at DESC
    `;
    const [rows] = await pool.execute(sql, [userId]);
    return rows.map(r => {
      const price = parseFloat(r.price);
      const discount = parseFloat(r.discountPercent);
      return {
        id: r.id,
        productId: r.productId,
        sizeId: r.sizeId,
        quantity: r.quantity,
        product: {
          id: r.productId,
          slug: r.slug,
          name: r.name,
          price,
          discountPercent: discount,
          originalPrice: discount > 0 ? Math.round(price / (1 - discount / 100)) : null,
          image: r.image || ''
        },
        size: r.size
      };
    });
  },

  /**
   * Check if an item exists in the cart.
   */
  async findItem(cartId, productId, sizeId) {
    const [rows] = await pool.execute(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND size_id = ?',
      [cartId, productId, sizeId]
    );
    return rows[0] || null;
  },

  /**
   * Fetch a cart item by its ID.
   */
  async findItemById(cartItemId) {
    const [rows] = await pool.execute(
      'SELECT id, cart_id, product_id, size_id, quantity FROM cart_items WHERE id = ?',
      [cartItemId]
    );
    return rows[0] || null;
  },

  /**
   * Add a new item to the cart or update the quantity of an existing one.
   */
  async addItem(cartId, productId, sizeId, quantity) {
    const existing = await this.findItem(cartId, productId, sizeId);
    if (existing) {
      await pool.execute(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing.id]
      );
      return existing.id;
    }

    const [result] = await pool.execute(
      'INSERT INTO cart_items (cart_id, product_id, size_id, quantity) VALUES (?, ?, ?, ?)',
      [cartId, productId, sizeId, quantity]
    );
    return result.insertId;
  },

  /**
   * Update the quantity of a cart item.
   */
  async updateItemQuantity(cartItemId, quantity) {
    const [result] = await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, cartItemId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Remove a single item from the cart.
   */
  async removeItem(cartItemId) {
    const [result] = await pool.execute('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
    return result.affectedRows > 0;
  },

  /**
   * Clear all items in the specified cart.
   */
  async clearCart(cartId) {
    const [result] = await pool.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    return result.affectedRows > 0;
  }
};
