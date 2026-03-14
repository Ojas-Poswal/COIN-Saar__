// src/db/database.js
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Check your DATABASE_URL in .env');
    process.exit(1);
  }
  console.log('✅ Connected to PostgreSQL');
  release();
});

// ─── Schema bootstrap ─────────────────────────────────────────────────────────

async function bootstrap() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      name        TEXT,
      password    TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_subscriptions (
      id                 TEXT PRIMARY KEY,
      user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_email         TEXT NOT NULL,
      plan               TEXT NOT NULL DEFAULT 'free',
      valid_until        TIMESTAMPTZ,
      payment_reference  TEXT UNIQUE,
      amount_paid_inr    NUMERIC DEFAULT 0,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id                  TEXT PRIMARY KEY,
      user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date                TEXT NOT NULL,
      asset_symbol        TEXT NOT NULL,
      asset_name          TEXT,
      asset_type          TEXT NOT NULL DEFAULT 'Crypto',
      transaction_type    TEXT NOT NULL,
      quantity            NUMERIC NOT NULL DEFAULT 0,
      price_per_unit_inr  NUMERIC NOT NULL DEFAULT 0,
      total_value_inr     NUMERIC NOT NULL DEFAULT 0,
      fee_inr             NUMERIC DEFAULT 0,
      tds_deducted_inr    NUMERIC DEFAULT 0,
      platform            TEXT,
      financial_year      TEXT,
      notes               TEXT,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id           TEXT PRIMARY KEY,
      user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_email   TEXT NOT NULL,
      label        TEXT,
      address      TEXT NOT NULL,
      chain        TEXT NOT NULL DEFAULT 'Ethereum',
      last_synced  TIMESTAMPTZ,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_tx_user    ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_tx_date    ON transactions(date DESC);
    CREATE INDEX IF NOT EXISTS idx_tx_fy      ON transactions(financial_year);
    CREATE INDEX IF NOT EXISTS idx_tx_symbol  ON transactions(asset_symbol);
    CREATE INDEX IF NOT EXISTS idx_tx_type    ON transactions(transaction_type);
    CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
    CREATE INDEX IF NOT EXISTS idx_subs_user  ON user_subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_subs_email ON user_subscriptions(user_email);
  `);
  console.log('✅ Database schema ready');
}

bootstrap().catch(err => {
  console.error('❌ Schema bootstrap failed:', err.message);
  process.exit(1);
});

// ─── db helper ────────────────────────────────────────────────────────────────

const db = {
  // Run any query, return all rows
  all: async (text, params = []) => {
    const res = await pool.query(text, params);
    return res.rows;
  },

  // Return first row or null
  get: async (text, params = []) => {
    const res = await pool.query(text, params);
    return res.rows[0] || null;
  },

  // Run insert/update/delete, return first row if RETURNING used
  run: async (text, params = []) => {
    const res = await pool.query(text, params);
    return res.rows[0] || null;
  },

  // Transaction wrapper
  transaction: async (fn) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

export default db;
