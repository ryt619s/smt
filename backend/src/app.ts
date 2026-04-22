import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes           from './routes/authRoutes';
import forgotPasswordRoutes from './routes/forgotPasswordRoutes';
import withdrawRoutes       from './routes/withdrawRoutes';
import adminRoutes          from './routes/adminRoutes';
import walletRoutes         from './routes/walletRoutes';
import dashboardRoutes      from './routes/dashboardRoutes';
import swapRoutes           from './routes/swapRoutes';

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 2000, // Increased for dev, lower in prod
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', time: new Date() }));
app.get('/test',   (_req, res) => res.send('OK'));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/auth',     forgotPasswordRoutes);
app.use('/api/withdraw', withdrawRoutes);
app.use('/api/wallet',   walletRoutes);
app.use('/api/user',     dashboardRoutes);
app.use('/api/swap',     swapRoutes);
app.use('/api/admin',    adminRoutes);

export default app;
