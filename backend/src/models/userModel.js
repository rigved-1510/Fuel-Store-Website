import pool from '../config/db.js';

/**
 * User model — all database queries related to the users table.
 * Never returns password_hash in SELECT queries (except findByEmail for auth).
 */

const SAFE_COLUMNS = 'id, first_name, last_name, email, phone, role, is_verified, google_id, provider, avatar, created_at, updated_at';

export const UserModel = {
  /**
   * Find a user by email. Includes password_hash for login verification.
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, email, password_hash, phone, role, is_verified, google_id, provider, avatar, created_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by ID. Does NOT return password_hash.
   */
  async findByGoogleId(googleId) {
    const [rows] = await pool.execute(
      `SELECT ${SAFE_COLUMNS}
      FROM users
      WHERE google_id = ?`,
      [googleId]
    );

    return rows[0] || null;
  },
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT ${SAFE_COLUMNS} FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user.
   */
  async create({ firstName, lastName, email, passwordHash, phone = null }) {
    const [result] = await pool.execute(
      'INSERT INTO users (first_name, last_name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, passwordHash, phone]
    );
    return result.insertId;
  },
  async createGoogleUser({
    firstName,
    lastName,
    email,
    googleId,
    avatar
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO users
      (
        first_name,
        last_name,
        email,
        google_id,
        avatar,
        provider
      )
      VALUES (?, ?, ?, ?, ?, 'google')
      `,
      [
        firstName,
        lastName,
        email,
        googleId,
        avatar,
        'google'
      ]
    );

    return result.insertId;
  },

  /**
   * Update user profile fields (first_name, last_name, email, phone).
   */
  async linkGoogleAccount(id, googleId, avatar) {
    const [result] = await pool.execute(
      `
      UPDATE users
      SET
        google_id = ?,
        avatar = ?,
        provider = 'google'
      WHERE id = ?
      `,
      [googleId, avatar, id]
    );

    return result.affectedRows > 0;
  },
  async updateProfile(id, { firstName, lastName, email, phone }) {
    const [result] = await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?',
      [firstName, lastName, email, phone, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Update user password hash.
   */
  async updatePassword(id, passwordHash) {
    const [result] = await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Get password hash for a specific user (used during change-password).
   */
  async getPasswordHash(id) {
    const [rows] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [id]
    );
    return rows[0]?.password_hash || null;
  },

  /**
   * Fetch all users (admin use). Never returns password_hash.
   */
  async findAll() {
    const [rows] = await pool.execute(`SELECT ${SAFE_COLUMNS} FROM users ORDER BY created_at DESC`);
    return rows;
  },
};
