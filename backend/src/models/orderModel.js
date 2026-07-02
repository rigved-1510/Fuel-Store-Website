import pool from '../config/db.js';

/**
 * Formats a raw orders row into a clean API response object.
 */
function formatOrder(o, items = []) {
  return {
    id: o.id,
    userId: o.user_id,
    orderStatus: o.order_status,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    subtotal: parseFloat(o.subtotal),
    shippingCharge: parseFloat(o.shipping_charge),
    discount: parseFloat(o.discount),
    totalAmount: parseFloat(o.total_amount),
    transactionId: o.transaction_id || null,
    shippingAddress: {
      fullName: o.full_name,
      phone: o.phone,
      addressLine1: o.address_line1,
      addressLine2: o.address_line2 || null,
      city: o.city,
      state: o.state,
      postalCode: o.postal_code,
      country: o.country
    },
    orderedAt: o.ordered_at,
    updatedAt: o.updated_at,
    items
  };
}

/**
 * Formats a raw order_items row.
 */
function formatItem(i) {
  return {
    id: i.id,
    productId: i.product_id,
    productName: i.product_name,
    productImage: i.product_image || null,
    club: i.club || null,
    categoryName: i.category_name || null,
    sizeName: i.size_name,
    quantity: i.quantity,
    unitPrice: parseFloat(i.unit_price),
    totalPrice: parseFloat(i.total_price)
  };
}

export const OrderModel = {
  /**
   * Place a new order atomically:
   *  1. Insert order header with snapshotted shipping address
   *  2. Insert order items (name, image, price snapshots)
   *  3. Reduce stock for each item in product_sizes
   *  4. Log each stock reduction in inventory_logs
   *  5. Clear the user's cart
   * Rolls back everything on any failure.
   */
  async placeOrder({ userId, cartId, items, subtotal, shippingCharge, discount, totalAmount, paymentMethod, address }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Insert order header
      const [orderResult] = await conn.execute(
        `INSERT INTO orders
           (user_id, payment_method, subtotal, shipping_charge, discount, total_amount,
            full_name, phone, address_line1, address_line2, city, state, postal_code, country)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, paymentMethod,
          subtotal, shippingCharge, discount, totalAmount,
          address.fullName, address.phone, address.addressLine1,
          address.addressLine2 || null,
          address.city, address.state, address.postalCode, address.country
        ]
      );
      const orderId = orderResult.insertId;

      // 2. Insert items + 3. Reduce stock + 4. Inventory log
      for (const item of items) {
        // a. Insert order item (snapshot product details at time of order)
        await conn.execute(
          `INSERT INTO order_items
             (order_id, product_id, product_name, product_image, club, category_name,
              size_name, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            item.productName,
            item.productImage || null,
            item.club || null,
            item.categoryName || null,
            item.sizeName,
            item.quantity,
            item.unitPrice,
            item.unitPrice * item.quantity
          ]
        );

        // b. Lock the product_sizes row and validate stock (FOR UPDATE prevents race conditions)
        const [psRows] = await conn.execute(
          'SELECT id, stock FROM product_sizes WHERE product_id = ? AND size_id = ? FOR UPDATE',
          [item.productId, item.sizeId]
        );
        if (psRows.length === 0) {
          throw new Error(`Product size not found for product ID ${item.productId}, size ID ${item.sizeId}.`);
        }
        const ps = psRows[0];
        if (ps.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${item.productName}" (${item.sizeName}). Available: ${ps.stock}, requested: ${item.quantity}.`);
        }

        // c. Reduce stock
        await conn.execute(
          'UPDATE product_sizes SET stock = stock - ? WHERE id = ?',
          [item.quantity, ps.id]
        );

        // d. Log the inventory deduction
        await conn.execute(
          'INSERT INTO inventory_logs (product_size_id, quantity_change, reason, remarks) VALUES (?, ?, ?, ?)',
          [ps.id, -item.quantity, 'sale', `Order #${orderId}`]
        );
      }

      // 5. Clear the user's cart
      await conn.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

      await conn.commit();
      return orderId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Fetch a single order with its items by order ID.
   */
  async findById(orderId) {
    const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) return null;

    const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    return formatOrder(orders[0], items.map(formatItem));
  },

  /**
   * Fetch all orders for a specific user (history), newest first.
   */
  async findByUser(userId) {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY ordered_at DESC',
      [userId]
    );
    if (orders.length === 0) return [];

    const orderIds = orders.map(o => o.id);
    const [items] = await pool.query(
      `SELECT * FROM order_items WHERE order_id IN (${orderIds.join(',')}) ORDER BY order_id`
    );

    // Group items by order_id
    const itemsMap = {};
    items.forEach(item => {
      if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
      itemsMap[item.order_id].push(formatItem(item));
    });

    return orders.map(o => formatOrder(o, itemsMap[o.id] || []));
  },

  /**
   * Fetch all orders (admin view) with optional status filter, newest first.
   */
  async findAll({ status, paymentStatus, limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND order_status = ?';
      params.push(status);
    }
    if (paymentStatus) {
      sql += ' AND payment_status = ?';
      params.push(paymentStatus);
    }

    sql += ' ORDER BY ordered_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [orders] = await pool.query(sql, params);
    if (orders.length === 0) return [];

    const orderIds = orders.map(o => o.id);
    const [items] = await pool.query(
      `SELECT * FROM order_items WHERE order_id IN (${orderIds.join(',')}) ORDER BY order_id`
    );

    const itemsMap = {};
    items.forEach(item => {
      if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
      itemsMap[item.order_id].push(formatItem(item));
    });

    return orders.map(o => formatOrder(o, itemsMap[o.id] || []));
  },

  /**
   * Update order status (admin).
   */
  async updateStatus(orderId, { orderStatus, paymentStatus, transactionId }) {
    const fields = [];
    const params = [];

    if (orderStatus !== undefined) { fields.push('order_status = ?'); params.push(orderStatus); }
    if (paymentStatus !== undefined) { fields.push('payment_status = ?'); params.push(paymentStatus); }
    if (transactionId !== undefined) { fields.push('transaction_id = ?'); params.push(transactionId); }

    if (fields.length === 0) return false;

    params.push(orderId);
    const [result] = await pool.execute(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  },

  /**
   * Cancel an order: sets order_status to 'cancelled' and restocks items atomically.
   */
  async cancelOrder(orderId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Mark order cancelled
      await conn.execute(
        "UPDATE orders SET order_status = 'cancelled' WHERE id = ?",
        [orderId]
      );

      // Restock each item
      const [items] = await conn.execute(
        `SELECT oi.product_id, oi.size_name, oi.quantity, s.id as size_id
         FROM order_items oi
         JOIN sizes s ON s.name = oi.size_name
         WHERE oi.order_id = ?`,
        [orderId]
      );

      for (const item of items) {
        const [psRows] = await conn.execute(
          'SELECT id FROM product_sizes WHERE product_id = ? AND size_id = ?',
          [item.product_id, item.size_id]
        );
        if (psRows.length > 0) {
          const psId = psRows[0].id;
          await conn.execute('UPDATE product_sizes SET stock = stock + ? WHERE id = ?', [item.quantity, psId]);
          await conn.execute(
            'INSERT INTO inventory_logs (product_size_id, quantity_change, reason, remarks) VALUES (?, ?, ?, ?)',
            [psId, item.quantity, 'return', `Order #${orderId} cancelled`]
          );
        }
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
};
