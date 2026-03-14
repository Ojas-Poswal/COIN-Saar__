// src/routes/subscriptions.js
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// ─── GET /api/subscriptions/me ────────────────────────────────────────────────
router.get('/me', async (req, res, next) => {
  try {
    const sub = await db.get(`
      SELECT * FROM user_subscriptions
      WHERE user_id = $1
        AND plan = 'premium'
        AND (valid_until IS NULL OR valid_until > NOW())
      ORDER BY created_at DESC
      LIMIT 1`,
      [req.user.id]
    );
    return res.json({ isPremium: !!sub, subscription: sub || null });
  } catch (err) { next(err); }
});

// ─── POST /api/subscriptions ──────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { payment_reference, plan = 'premium' } = req.body;
    if (!payment_reference) {
      return res.status(400).json({ error: 'payment_reference is required' });
    }

    const duplicate = await db.get(
      'SELECT id FROM user_subscriptions WHERE payment_reference = $1',
      [payment_reference]
    );
    if (duplicate) return res.status(409).json({ error: 'Payment reference already used' });

    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const sub = await db.run(`
      INSERT INTO user_subscriptions
        (id, user_id, user_email, plan, valid_until, payment_reference, amount_paid_inr)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [uuidv4(), req.user.id, req.user.email, plan, validUntil.toISOString(), payment_reference, 499]
    );

    return res.status(201).json({ subscription: sub, isPremium: true });
  } catch (err) { next(err); }
});

export default router;
