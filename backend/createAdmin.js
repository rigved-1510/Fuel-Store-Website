import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from './src/config/db.js';

async function createAdmin() {
  const email = 'admin@fuelstore.com';
  const password = 'AdminPass123';
  const saltRounds = 12;

  try {
    // Check if admin already exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      // Update role to admin just in case it was a customer
      await pool.execute('UPDATE users SET role = ? WHERE email = ?', ['admin', email]);
      console.log('Admin user already exists. Ensured role is "admin".');
      return;
    }

    const hash = await bcrypt.hash(password, saltRounds);

    await pool.execute(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, is_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Admin', 'User', email, hash, 'admin', 1]
    );

    console.log(`Admin user created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Failed to create admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();
