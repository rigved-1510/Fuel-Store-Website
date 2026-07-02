import pool from '../config/db.js';

export const CategoryModel = {
  /**
   * Find all categories.
   */
  async findAll() {
    const [rows] = await pool.execute('SELECT id, name FROM categories ORDER BY name ASC');
    return rows;
  },

  /**
   * Find a category by ID.
   */
  async findById(id) {
    const [rows] = await pool.execute('SELECT id, name FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  }
};
