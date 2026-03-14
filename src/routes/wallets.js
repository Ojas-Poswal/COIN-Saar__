// src/routes/wallets.js
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const VALID_CHAINS = ['Ethereum', 'Bitcoin', 'BSC', 'Polygon'];

// ─── GET /api/wallets ─────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const rows = await db.all(
      'SELECT * FROM wallets WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) { next(err); }
});

// ─── POST /api/wallets ────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { address, chain, label } = req.body;
    if (!address) return res.status(400).json({ error: 'address is required' });
    if (!VALID_CHAINS.includes(chain)) {
      return res.status(400).json({ error: `chain must be one of: ${VALID_CHAINS.join(', ')}` });
    }

    const existing = await db.get(
      'SELECT id FROM wallets WHERE user_id = $1 AND address = $2 AND chain = $3',
      [req.user.id, address, chain]
    );
    if (existing) return res.status(409).json({ error: 'Wallet already added for this chain' });

    const row = await db.run(
      `INSERT INTO wallets (id, user_id, user_email, label, address, chain)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [uuidv4(), req.user.id, req.user.email, label || null, address, chain]
    );
    return res.status(201).json(row);
  } catch (err) { next(err); }
});

// ─── PATCH /api/wallets/:id ───────────────────────────────────────────────────
router.patch('/:id', async (req, res, next) => {
  try {
    const wallet = await db.get(
      'SELECT id FROM wallets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const sets = [];
    const params = [];
    let i = 1;

    if (req.body.label       !== undefined) { sets.push(`label = $${i++}`);       params.push(req.body.label); }
    if (req.body.last_synced !== undefined) { sets.push(`last_synced = $${i++}`); params.push(req.body.last_synced); }

    if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });
    sets.push('updated_at = NOW()');
    params.push(req.params.id);

    const updated = await db.run(
      `UPDATE wallets SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    return res.json(updated);
  } catch (err) { next(err); }
});

// ─── DELETE /api/wallets/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const row = await db.get(
      'SELECT id FROM wallets WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!row) return res.status(404).json({ error: 'Wallet not found' });
    await db.run('DELETE FROM wallets WHERE id = $1', [req.params.id]);
    return res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
