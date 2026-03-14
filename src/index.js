// src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes         from './routes/auth.js';
import transactionRoutes  from './routes/transactions.js';
import walletRoutes       from './routes/wallets.js';
import subscriptionRoutes from './routes/subscriptions.js';
import taxRoutes          from './routes/tax.js';
import { errorHandler }   from './middleware/errorHandler.js';

// Connects to PostgreSQL and bootstraps schema
import './db/database.js';

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, slow down' },
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

app.use('/api/auth',          authRoutes);
app.use('/api/transactions',  transactionRoutes);
app.use('/api/wallets',       walletRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/tax',           taxRoutes);

app.use((req, res) =>
  res.status(404).json({ error: `${req.method} ${req.path} not found` })
);

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 CoinSaar backend running at http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   CORS origins: ${allowedOrigins.join(', ')}\n`);
});
