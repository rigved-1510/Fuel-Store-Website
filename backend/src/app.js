import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import { sendError } from './utils/apiResponse.js';
import { verifyToken, isAdmin } from './middleware/auth.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.set('trust proxy', 1);

// ─── SECURITY HEADERS ────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
// ─── CORS ────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://fuel-store-website.vercel.app'
  ],
  credentials: true,
}));

// ─── BODY PARSERS ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── REQUEST LOGGING ─────────────────────────────────────────────────
app.use(morgan('dev'));

// ─── RATE LIMITING (auth routes) ─────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,                   // 20 requests per window
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.get(
  '/api/admin/test',
  verifyToken,
  isAdmin,
  (req, res) => {
    res.json({
      success: true,
      message: 'Admin access granted!',
      user: req.user,
    });
  }
);

// ─── STATIC FILES (uploaded images) ──────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'))
);

// ─── HEALTH CHECK ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Fuel Fashion Hub API is running.', timestamp: new Date().toISOString() });
});

// ─── API ROUTES ──────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);

// Mounted route modules
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// ─── 404 HANDLER ─────────────────────────────────────────────────────
app.all('*splat', (req, res) => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found.`);
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────
app.use(errorHandler);

export default app;
