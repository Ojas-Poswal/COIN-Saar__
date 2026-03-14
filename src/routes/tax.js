// src/routes/tax.js
import { Router } from 'express';
import db from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const BUY_TYPES  = ['Buy','Transfer In','Airdrop','Mining','Staking Reward','Gift Received'];
const SELL_TYPES = ['Sell','Gift Sent'];

function computeFIFO(transactions) {
  const lots    = {};
  const assetMap = {};

  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

  for (const t of sorted) {
    const key = t.asset_symbol;
    if (!lots[key])     lots[key]     = [];
    if (!assetMap[key]) assetMap[key] = {
      symbol: key, asset_type: t.asset_type || 'Crypto',
      saleConsideration: 0, costOfAcquisition: 0, tds: 0,
    };

    if (BUY_TYPES.includes(t.transaction_type)) {
      lots[key].push({ qty: parseFloat(t.quantity), costPerUnit: parseFloat(t.price_per_unit_inr) || 0 });
    }

    if (SELL_TYPES.includes(t.transaction_type)) {
      const saleValue = parseFloat(t.total_value_inr) || parseFloat(t.quantity) * parseFloat(t.price_per_unit_inr || 0);
      let qtyToSell = parseFloat(t.quantity);
      let costBasis = 0;

      while (qtyToSell > 1e-9 && lots[key]?.length > 0) {
        const lot  = lots[key][0];
        const used = Math.min(lot.qty, qtyToSell);
        costBasis   += used * lot.costPerUnit;
        lot.qty     -= used;
        qtyToSell   -= used;
        if (lot.qty <= 1e-9) lots[key].shift();
      }

      assetMap[key].saleConsideration += saleValue;
      assetMap[key].costOfAcquisition += costBasis;
      assetMap[key].tds               += parseFloat(t.tds_deducted_inr) || 0;
    }
  }
  return assetMap;
}

// ─── GET /api/tax/summary ─────────────────────────────────────────────────────
router.get('/summary', async (req, res, next) => {
  try {
    const { fy } = req.query;
    const params = [req.user.id];
    let where = 'WHERE user_id = $1';
    if (fy && fy !== 'all') { where += ' AND financial_year = $2'; params.push(fy); }

    const transactions = await db.all(`SELECT * FROM transactions ${where}`, params);

    let totalInvested = 0, totalTDS = 0, realisedPnL = 0;
    const portfolio = {};

    for (const t of transactions) {
      const val = parseFloat(t.total_value_inr) || parseFloat(t.quantity) * parseFloat(t.price_per_unit_inr || 0);
      const key = t.asset_symbol;
      if (!portfolio[key]) portfolio[key] = { symbol: key, name: t.asset_name || key, type: t.asset_type || 'Crypto', quantity: 0, totalCost: 0 };

      if (BUY_TYPES.includes(t.transaction_type)) {
        portfolio[key].quantity  += parseFloat(t.quantity);
        portfolio[key].totalCost += val;
        totalInvested += val;
      }
      if (SELL_TYPES.includes(t.transaction_type)) {
        const avg       = portfolio[key].quantity > 0 ? portfolio[key].totalCost / portfolio[key].quantity : 0;
        const costBasis = avg * parseFloat(t.quantity);
        realisedPnL += val - costBasis;
        portfolio[key].quantity  = Math.max(0, portfolio[key].quantity  - parseFloat(t.quantity));
        portfolio[key].totalCost = Math.max(0, portfolio[key].totalCost - costBasis);
      }
      totalTDS += parseFloat(t.tds_deducted_inr) || 0;
    }

    const holdings = Object.values(portfolio)
      .filter(h => h.quantity > 1e-6)
      .map(h => ({ ...h, avgBuyPrice: h.quantity > 0 ? h.totalCost / h.quantity : 0 }))
      .sort((a, b) => b.totalCost - a.totalCost);

    return res.json({
      totalInvested,
      totalValue: holdings.reduce((s, h) => s + h.totalCost, 0),
      realisedPnL,
      totalTDS,
      holdings,
    });
  } catch (err) { next(err); }
});

// ─── GET /api/tax/report ─────────────────────────────────────────────────────
router.get('/report', async (req, res, next) => {
  try {
    const { fy } = req.query;
    if (!fy) return res.status(400).json({ error: 'fy is required e.g. ?fy=2024-25' });

    // Check premium
    const sub = await db.get(`
      SELECT id FROM user_subscriptions
      WHERE user_id = $1 AND plan = 'premium'
        AND (valid_until IS NULL OR valid_until > NOW())
      LIMIT 1`, [req.user.id]
    );
    if (!sub) return res.status(403).json({ error: 'Premium subscription required', code: 'PREMIUM_REQUIRED' });

    const transactions = await db.all(
      'SELECT * FROM transactions WHERE user_id = $1 AND financial_year = $2 ORDER BY date ASC',
      [req.user.id, fy]
    );

    const assetMap = computeFIFO(transactions);

    const assetBreakdown = Object.values(assetMap)
      .filter(a => a.saleConsideration > 0)
      .map(a => ({
        ...a,
        netIncome: a.saleConsideration - a.costOfAcquisition,
        tax: Math.max(0, (a.saleConsideration - a.costOfAcquisition) * 0.30),
      }))
      .sort((a, b) => b.netIncome - a.netIncome);

    const totalGains  = assetBreakdown.reduce((s, a) => s + a.netIncome, 0);
    const taxPayable  = Math.max(0, totalGains * 0.30);
    const totalTDS    = transactions.reduce((s, t) => s + (parseFloat(t.tds_deducted_inr) || 0), 0);

    return res.json({
      financialYear: fy, totalGains, taxPayable, totalTDS,
      netTaxAfterTDS: Math.max(0, taxPayable - totalTDS),
      assetBreakdown,
    });
  } catch (err) { next(err); }
});

// ─── GET /api/tax/platform-volume ─────────────────────────────────────────────
router.get('/platform-volume', async (req, res, next) => {
  try {
    const { fy } = req.query;
    const params = [req.user.id];
    let where = 'WHERE user_id = $1 AND platform IS NOT NULL';
    if (fy && fy !== 'all') { where += ' AND financial_year = $2'; params.push(fy); }

    const rows = await db.all(
      `SELECT platform as name, SUM(total_value_inr) as value
       FROM transactions ${where}
       GROUP BY platform ORDER BY value DESC LIMIT 10`,
      params
    );
    return res.json(rows.map(r => ({ name: r.name, value: parseFloat(r.value) || 0 })));
  } catch (err) { next(err); }
});

export default router;
