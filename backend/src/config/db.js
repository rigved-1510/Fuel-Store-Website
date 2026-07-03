import mysql from 'mysql2/promise';
import { logger } from '../utils/logger.js';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Test the database connection on startup.
 * Throws if the connection fails so the server doesn't start silently broken.
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    logger.info(`MySQL connected — ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    connection.release();
  } catch (error) {
    console.error(error);
    logger.error('MySQL connection failed:', error);
    throw error;
  }
}

export default pool;
