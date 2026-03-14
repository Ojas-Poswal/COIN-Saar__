# CoinSaar – Complete Setup Guide

## Project Structure

```
coinsaar-backend/          ← This zip (backend)
  src/
    index.js               ← Express server entry point
    db/database.js         ← PostgreSQL connection + schema
    middleware/
      auth.js              ← JWT auth middleware
      errorHandler.js      ← Global error handler
    routes/
      auth.js              ← /api/auth/*
      transactions.js      ← /api/transactions/*
      wallets.js           ← /api/wallets/*
      subscriptions.js     ← /api/subscriptions/*
      tax.js               ← /api/tax/*
  FRONTEND_base44Client.js ← Copy to frontend: src/api/base44Client.js
  FRONTEND_AuthContext.jsx ← Copy to frontend: src/lib/AuthContext.jsx
  FRONTEND_App.jsx         ← Copy to frontend: src/App.jsx
  .env.example             ← Copy to .env and fill in values
  package.json

COIN-SAAR_ (your frontend) ← Already exists on your machine
```

---

## STEP 1 — Set up PostgreSQL on Supabase (free, 5 min)

1. Go to https://supabase.com → Sign up free
2. Click **New Project** → name it `coinsaar`
3. Set a database password → save it somewhere safe
4. Region: **Southeast Asia (Singapore)**
5. Wait ~2 minutes for it to spin up
6. Go to **Settings → Database**
7. Scroll to **Connection string → URI** tab
8. Copy the string — looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdef.supabase.co:5432/postgres
   ```

---

## STEP 2 — Set up the backend

```bash
cd coinsaar-backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres
JWT_SECRET=any_long_random_string_at_least_32_chars_like_this_one_here
PORT=4000
CORS_ORIGINS=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL
✅ Database schema ready
🚀 CoinSaar backend running at http://localhost:4000
```

Test it:
```bash
curl http://localhost:4000/health
```

---

## STEP 3 — Copy frontend files

Copy these 3 files from the zip into your frontend project:

| File in zip                  | Copy to (in COIN-SAAR_ folder)       |
|------------------------------|---------------------------------------|
| FRONTEND_base44Client.js     | src/api/base44Client.js               |
| FRONTEND_AuthContext.jsx     | src/lib/AuthContext.jsx               |
| FRONTEND_App.jsx             | src/App.jsx                           |

**On Mac, from terminal:**
```bash
cp FRONTEND_base44Client.js ../COIN-SAAR_/src/api/base44Client.js
cp FRONTEND_AuthContext.jsx  ../COIN-SAAR_/src/lib/AuthContext.jsx
cp FRONTEND_App.jsx          ../COIN-SAAR_/src/App.jsx
```

---

## STEP 4 — Create a demo user

Since auth is bypassed in the frontend for now, create a demo user and hardcode its token:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@coinsaar.in","password":"demo1234","name":"Demo User"}'
```

Copy the `token` from the response. Then open `src/api/base44Client.js` in your frontend and add this line right after `const BASE_URL = ...`:

```js
localStorage.setItem('coinsaar_token', 'PASTE_YOUR_TOKEN_HERE');
```

---

## STEP 5 — Start the frontend

```bash
cd COIN-SAAR_
npm run dev
```

Open http://localhost:5173 — your app is now fully connected to PostgreSQL!

---

## STEP 6 — Verify data is saving to Supabase

1. Go to your app → Transactions → Add a transaction
2. Open https://supabase.com → your project → **Table Editor**
3. Click the `transactions` table — you should see your row there ✅

---

## API Endpoints Reference

| Method | Endpoint                          | What it does                    |
|--------|-----------------------------------|---------------------------------|
| GET    | /health                           | Health check                    |
| POST   | /api/auth/register                | Create account                  |
| POST   | /api/auth/login                   | Login                           |
| GET    | /api/auth/me                      | Get current user                |
| GET    | /api/transactions                 | List transactions (filterable)  |
| POST   | /api/transactions                 | Add transaction                 |
| POST   | /api/transactions/bulk            | Add many at once                |
| POST   | /api/transactions/import-csv      | Import CSV from exchange        |
| PATCH  | /api/transactions/:id             | Edit transaction                |
| DELETE | /api/transactions/:id             | Delete transaction              |
| GET    | /api/wallets                      | List wallets                    |
| POST   | /api/wallets                      | Add wallet                      |
| DELETE | /api/wallets/:id                  | Remove wallet                   |
| GET    | /api/tax/summary                  | Portfolio stats                 |
| GET    | /api/tax/report?fy=2024-25        | Full ITR report (premium only)  |
| GET    | /api/tax/platform-volume          | Chart data by platform          |
| GET    | /api/subscriptions/me             | Check premium status            |
| POST   | /api/subscriptions                | Activate premium                |

---

## When you add Google Auth later

1. After Google OAuth succeeds, call your backend:
   ```js
   const res = await fetch('http://localhost:4000/api/auth/google', {
     method: 'POST',
     body: JSON.stringify({ googleToken: tokenFromGoogle })
   })
   const { token } = await res.json()
   localStorage.setItem('coinsaar_token', token)
   ```
2. Remove the hardcoded `localStorage.setItem` line from `base44Client.js`
3. Done — everything else stays the same
