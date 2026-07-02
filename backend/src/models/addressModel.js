import pool from '../config/db.js';

export const AddressModel = {
  /**
   * Get all addresses for a user.
   */
  async findAllByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT id, user_id, full_name, phone, address_line1, address_line2,
              city, state, postal_code, country, is_default, created_at, updated_at
       FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    return rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      fullName: r.full_name,
      phone: r.phone,
      addressLine1: r.address_line1,
      addressLine2: r.address_line2 || null,
      city: r.city,
      state: r.state,
      postalCode: r.postal_code,
      country: r.country,
      isDefault: r.is_default === 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  },

  /**
   * Find a single address by ID.
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, user_id, full_name, phone, address_line1, address_line2,
              city, state, postal_code, country, is_default, created_at, updated_at
       FROM addresses WHERE id = ?`,
      [id]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      fullName: r.full_name,
      phone: r.phone,
      addressLine1: r.address_line1,
      addressLine2: r.address_line2 || null,
      city: r.city,
      state: r.state,
      postalCode: r.postal_code,
      country: r.country,
      isDefault: r.is_default === 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  },

  /**
   * Create a new address. If isDefault is true, clear existing defaults first.
   */
  async create({ userId, fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (isDefault) {
        await conn.execute('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
      }

      // If this is the first address for the user, auto-set as default
      const [existing] = await conn.execute('SELECT COUNT(*) as cnt FROM addresses WHERE user_id = ?', [userId]);
      const makeDefault = isDefault || existing[0].cnt === 0;

      const [result] = await conn.execute(
        `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2,
                                city, state, postal_code, country, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, fullName, phone, addressLine1, addressLine2 || null, city, state, postalCode, country || 'India', makeDefault ? 1 : 0]
      );

      await conn.commit();
      return result.insertId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Update an existing address.
   */
  async update(id, { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (isDefault) {
        const [addrRows] = await conn.execute('SELECT user_id FROM addresses WHERE id = ?', [id]);
        if (addrRows.length > 0) {
          await conn.execute('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [addrRows[0].user_id]);
        }
      }

      await conn.execute(
        `UPDATE addresses
         SET full_name = ?, phone = ?, address_line1 = ?, address_line2 = ?,
             city = ?, state = ?, postal_code = ?, country = ?, is_default = ?
         WHERE id = ?`,
        [fullName, phone, addressLine1, addressLine2 || null, city, state, postalCode, country || 'India', isDefault ? 1 : 0, id]
      );

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Set a specific address as default.
   */
  async setDefault(userId, addressId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
      await conn.execute('UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?', [addressId, userId]);
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Delete an address by ID.
   */
  async delete(id) {
    const [result] = await pool.execute('DELETE FROM addresses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};
