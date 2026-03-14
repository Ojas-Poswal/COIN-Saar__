// src/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import db from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
}

function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password, name } = req.body;

      const existing = await db.get('SELECT id FROM users WHERE email = $1', [email]);
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const hash = await bcrypt.hash(password, 12);
      const id = uuidv4();

      const user = await db.run(
        'INSERT INTO users (id, email, name, password) VALUES ($1,$2,$3,$4) RETURNING *',
        [id, email, name || null, hash]
      );

      return res.status(201).json({ token: signToken(user), user: safeUser(user) });
    } catch (err) { next(err); }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await db.get('SELECT * FROM users WHERE email = $1', [email]);
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

      return res.json({ token: signToken(user), user: safeUser(user) });
    } catch (err) { next(err); }
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(safeUser(user));
  } catch (err) { next(err); }
});

// ─── PATCH /api/auth/me ───────────────────────────────────────────────────────
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const sets = [];
    const params = [];
    let i = 1;

    if (name !== undefined)  { sets.push(`name = $${i++}`);     params.push(name); }
    if (password) {
      if (password.length < 8) return res.status(400).json({ error: 'Password min 8 chars' });
      sets.push(`password = $${i++}`);
      params.push(await bcrypt.hash(password, 12));
    }
    if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });

    sets.push(`updated_at = NOW()`);
    params.push(req.user.id);

    const user = await db.run(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    return res.json(safeUser(user));
  } catch (err) { next(err); }
});

export default router;
