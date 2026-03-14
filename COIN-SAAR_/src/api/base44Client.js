// src/api/base44Client.js  (place this in your FRONTEND project)
// Drop-in replacement for the Base44 SDK

const BASE_URL = 'http://localhost:4000/api';

localStorage.setItem('coinsaar_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ0NGZlOTI0LWNiOTctNDA1OC05ZDIzLTQzMmNmNTNmMWQ5NiIsImVtYWlsIjoiZGVtb0Bjb2luc2Fhci5pbiIsIm5hbWUiOiJEZW1vIFVzZXIiLCJpYXQiOjE3NzM1MjAyNDUsImV4cCI6MTc3NjExMjI0NX0.gvgTNzVwJHCFuZQ5JsrWYDjLbsjtgTclJNfChX5mdkE');

// ─── Token storage ────────────────────────────────────────────────────────────
export const tokenStore = {
  get:    ()      => localStorage.getItem('coinsaar_token'),
  set:    (token) => localStorage.setItem('coinsaar_token', token),
  remove: ()      => localStorage.removeItem('coinsaar_token'),
};

// ─── Core fetch ───────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = tokenStore.get();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res  = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    tokenStore.remove();
    window.dispatchEvent(new Event('auth:logout'));
  }
  if (!res.ok) throw Object.assign(new Error(data.error || 'API error'), { status: res.status });
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  me:       ()                      => apiFetch('/auth/me'),
  register: (email, password, name) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }).then(d => { tokenStore.set(d.token); return d; }),
  login:    (email, password)       => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify({ email, password }) }).then(d => { tokenStore.set(d.token); return d; }),
  updateMe: (updates)               => apiFetch('/auth/me',       { method: 'PATCH', body: JSON.stringify(updates) }),
  logout:   ()                      => tokenStore.remove(),
  isLoggedIn: ()                    => !!tokenStore.get(),
};

// ─── Entity factory ───────────────────────────────────────────────────────────
function makeEntity(apiPath) {
  return {
    list: (sort = '-date', limit = 500) =>
      apiFetch(`${apiPath}?sort=${sort}&limit=${limit}`)
        .then(d => d.transactions ?? d),

    filter: (filters = {}) => {
      const qs = Object.entries(filters)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
      return apiFetch(`${apiPath}?${qs}`)
        .then(d => Array.isArray(d) ? d : d.transactions ?? d.wallets ?? d);
    },

    get:    (id)       => apiFetch(`${apiPath}/${id}`),
    create: (data)     => apiFetch(apiPath, { method: 'POST',   body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`${apiPath}/${id}`, { method: 'PATCH',  body: JSON.stringify(data) }),
    delete: (id)       => apiFetch(`${apiPath}/${id}`, { method: 'DELETE' }),
    bulk:   (txs)      => apiFetch(`${apiPath}/bulk`,  { method: 'POST',   body: JSON.stringify({ transactions: txs }) }),
  };
}

// ─── CSV Import ───────────────────────────────────────────────────────────────
export async function importCSV(file, platform = '') {
  const token = tokenStore.get();
  const fd    = new FormData();
  fd.append('file', file);
  if (platform) fd.append('platform', platform);

  const res  = await fetch(`${BASE_URL}/transactions/import-csv`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'CSV import failed');
  return data;
}

// ─── Tax ──────────────────────────────────────────────────────────────────────
export const tax = {
  summary:        (fy) => apiFetch(`/tax/summary${fy ? `?fy=${fy}` : ''}`),
  report:         (fy) => apiFetch(`/tax/report?fy=${fy}`),
  platformVolume: (fy) => apiFetch(`/tax/platform-volume${fy ? `?fy=${fy}` : ''}`),
};

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = {
  me:       ()      => apiFetch('/subscriptions/me'),
  activate: (ref)   => apiFetch('/subscriptions', { method: 'POST', body: JSON.stringify({ payment_reference: ref }) }),
};

// ─── Main export (matches base44.entities.*, base44.auth.* shape) ─────────────
export const base44 = {
  auth,
  tax,
  subscriptions,
  importCSV,
  entities: {
    Transaction: makeEntity('/transactions'),
    Wallet:      makeEntity('/wallets'),
    UserSubscription: {
      filter: () => subscriptions.me().then(d => d.subscription ? [d.subscription] : []),
      create: (data) => subscriptions.activate(data.payment_reference),
    },
  },
};
