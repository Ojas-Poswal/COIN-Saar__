// src/routes/transactions.js
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import Papa from 'papaparse';
import db from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const VALID_TYPES = [
  'Buy','Sell','Transfer In','Transfer Out',
  'Airdrop','Mining','Staking Reward','Gift Received','Gift Sent',
];

function getFinancialYear(dateStr) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return month >= 4
    ? `${year}-${String(year + 1).slice(2)}`
    : `${year - 1}-${String(year).slice(2)}`;
}

async function insertTransaction(userId, data) {
  const id  = uuidv4();
  const fy  = data.financial_year || (data.date ? getFinancialYear(data.date) : null);
  const row = await db.run(`
    INSERT INTO transactions (
      id, user_id, date, asset_symbol, asset_name, asset_type,
      transaction_type, quantity, price_per_unit_inr, total_value_inr,
      fee_inr, tds_deducted_inr, platform, financial_year, notes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    RETURNING *`,
    [
      id, userId,
      data.date,
      (data.asset_symbol || '').toUpperCase().trim(),
      data.asset_name   || null,
      data.asset_type   || 'Crypto',
      data.transaction_type,
      parseFloat(data.quantity)            || 0,
      parseFloat(data.price_per_unit_inr)  || 0,
      parseFloat(data.total_value_inr)     || 0,
      parseFloat(data.fee_inr)             || 0,
      parseFloat(data.tds_deducted_inr)    || 0,
      data.platform      || null,
      fy,
      data.notes         || null,
    ]
  );
  return row;
}

// ─── GET /api/transactions ────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { fy, type, search, sort = '-date', limit = 500, offset = 0 } = req.query;

    let where = 'WHERE user_id = $1';
    const params = [req.user.id];
    let i = 2;

    if (fy && fy !== 'all')   { where += ` AND financial_year = $${i++}`;                          params.push(fy); }
    if (type && type !== 'all') { where += ` AND transaction_type = $${i++}`;                      params.push(type); }
    if (search)               { where += ` AND (asset_symbol ILIKE $${i} OR platform ILIKE $${i++})`; params.push(`%${search}%`); }

    const orderMap = {
      '-date': 'date DESC', 'date': 'date ASC',
      '-total_value_inr': 'total_value_inr DESC', 'total_value_inr': 'total_value_inr ASC',
    };
    const order = orderMap[sort] || 'date DESC';

    params.push(parseInt(limit), parseInt(offset));
    const rows = await db.all(
      `SELECT * FROM transactions ${where} ORDER BY ${order} LIMIT $${i++} OFFSET $${i}`,
      params
    );

    const { count } = await db.get(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = $1',
      [req.user.id]
    );

    return res.json({ transactions: rows, total: parseInt(count) });
  } catch (err) { next(err); }
});

// ─── POST /api/transactions ───────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.date || !req.body.asset_symbol || !req.body.transaction_type) {
      return res.status(400).json({ error: 'date, asset_symbol and transaction_type are required' });
    }
    if (!VALID_TYPES.includes(req.body.transaction_type)) {
      return res.status(400).json({ error: 'Invalid transaction_type' });
    }
    const row = await insertTransaction(req.user.id, req.body);
    return res.status(201).json(row);
  } catch (err) { next(err); }
});

// ─── POST /api/transactions/bulk ─────────────────────────────────────────────
router.post('/bulk', async (req, res, next) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || !transactions.length) {
      return res.status(400).json({ error: 'transactions array required' });
    }
    if (transactions.length > 1000) {
      return res.status(400).json({ error: 'Max 1000 per bulk import' });
    }

    const created = await db.transaction(async () => {
      const rows = [];
      for (const t of transactions) {
        if (!t.asset_symbol || !t.transaction_type || !t.date) continue;
        rows.push(await insertTransaction(req.user.id, t));
      }
      return rows;
    });

    return res.status(201).json({ imported: created.length, transactions: created });
  } catch (err) { next(err); }
});

// ─── POST /api/transactions/import-csv ───────────────────────────────────────
router.post('/import-csv', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No CSV file uploaded' });

    const { data: rows } = Papa.parse(req.file.buffer.toString('utf-8'), {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().toLowerCase().replace(/\s+/g, '_'),
    });

    const platform = req.body.platform || 'CSV Import';
    const importErrors = [];
    let skipped = 0;

    const normalise = (row) => {
      // WazirX
      if ('coin' in row && 'type' in row) {
        const typeMap = { buy:'Buy', sell:'Sell', deposit:'Transfer In', withdrawal:'Transfer Out' };
        return {
          date: row.date || row.transaction_date,
          asset_symbol: row.coin?.toUpperCase(),
          asset_type: 'Crypto',
          transaction_type: typeMap[row.type?.toLowerCase()] || 'Buy',
          quantity: row.amount || row.quantity || 0,
          price_per_unit_inr: row.price || 0,
          total_value_inr: row.value || row.total || 0,
          fee_inr: row.fee || 0,
          tds_deducted_inr: row.tds || 0,
          platform: row.exchange || platform,
        };
      }
      // CoinDCX
      if ('currency' in row && 'transaction_kind' in row) {
        const typeMap = { buy:'Buy', sell:'Sell', deposit:'Transfer In', withdrawal:'Transfer Out' };
        return {
          date: row.date,
          asset_symbol: row.currency?.toUpperCase(),
          asset_type: 'Crypto',
          transaction_type: typeMap[row.transaction_kind?.toLowerCase()] || 'Buy',
          quantity: row.quantity || 0,
          price_per_unit_inr: row.price || 0,
          total_value_inr: row.total || 0,
          fee_inr: row.fee || 0,
          tds_deducted_inr: row.tds || 0,
          platform,
        };
      }
      // Binance
      if ('pair' in row && 'side' in row) {
        const base = row.pair?.replace(/usdt|busd|inr|btc|eth$/i, '')?.toUpperCase();
        return {
          date: row['date(utc)'] || row.date,
          asset_symbol: base,
          asset_type: 'Crypto',
          transaction_type: row.side?.toLowerCase() === 'sell' ? 'Sell' : 'Buy',
          quantity: parseFloat(row.executed?.replace(/[^0-9.]/g, '') || 0),
          price_per_unit_inr: row.price || 0,
          total_value_inr: parseFloat(row.amount?.replace(/[^0-9.]/g, '') || 0),
          fee_inr: parseFloat(row.fee?.replace(/[^0-9.]/g, '') || 0),
          tds_deducted_inr: 0,
          platform: 'Binance',
        };
      }
      // Generic / CoinSaar native
      return {
        date: row.date,
        asset_symbol: row.asset_symbol,
        asset_name: row.asset_name || null,
        asset_type: row.asset_type || 'Crypto',
        transaction_type: row.transaction_type,
        quantity: row.quantity || 0,
        price_per_unit_inr: row.price_per_unit_inr || 0,
        total_value_inr: row.total_value_inr || 0,
        fee_inr: row.fee_inr || 0,
        tds_deducted_inr: row.tds_deducted_inr || 0,
        platform: row.platform || platform,
        financial_year: row.financial_year || null,
        notes: row.notes || null,
      };
    };

    const created = await db.transaction(async () => {
      const results = [];
      for (let idx = 0; idx < rows.length; idx++) {
        try {
          const n = normalise(rows[idx]);
          if (!n.asset_symbol || !n.transaction_type || !n.date) { skipped++; continue; }
          results.push(await insertTransaction(req.user.id, n));
        } catch (e) {
          importErrors.push({ row: idx + 2, error: e.message });
        }
      }
      return results;
    });

    return res.status(201).json({ imported: created.length, skipped, errors: importErrors });
  } catch (err) { next(err); }
});

// ─── GET /api/transactions/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const row = await db.get(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!row) return res.status(404).json({ error: 'Transaction not found' });
    return res.json(row);
  } catch (err) { next(err); }
});

// ─── PATCH /api/transactions/:id ─────────────────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const existing = await db.get(
      'SELECT id FROM transactions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    const fields = [
      'date','asset_symbol','asset_name','asset_type','transaction_type',
      'quantity','price_per_unit_inr','total_value_inr',
      'fee_inr','tds_deducted_inr','platform','financial_year','notes',
    ];

    const sets = [];
    const params = [];
    let i = 1;

    fields.forEach(f => {
      if (req.body[f] !== undefined) { sets.push(`${f} = $${i++}`); params.push(req.body[f]); }
    });

    if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });

    if (req.body.date && !req.body.financial_year) {
      sets.push(`financial_year = $${i++}`);
      params.push(getFinancialYear(req.body.date));
    }

    sets.push(`updated_at = NOW()`);
    params.push(req.params.id);

    const updated = await db.run(
      `UPDATE transactions SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    return res.json(updated);
  } catch (err) { next(err); }
});

// ─── DELETE /api/transactions/:id ────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const row = await db.get(
      'SELECT id FROM transactions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!row) return res.status(404).json({ error: 'Transaction not found' });
    await db.run('DELETE FROM transactions WHERE id = $1', [req.params.id]);
    return res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
