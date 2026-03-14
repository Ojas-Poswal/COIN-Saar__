import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import AssetHoldings from "@/components/dashboard/AssetHoldings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FY_OPTIONS = ["2025-26", "2024-25", "2023-24", "2022-23", "2021-22"];
const STORAGE_KEY = "coinsaar_dashboard_fy";
const COLORS = ["#6c47ff", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

function normalise(t) {
  return {
    ...t,
    quantity:           Number(t.quantity)           || 0,
    price_per_unit_inr: Number(t.price_per_unit_inr) || 0,
    total_value_inr:    Number(t.total_value_inr)    || 0,
    fee_inr:            Number(t.fee_inr)            || 0,
    tds_deducted_inr:   Number(t.tds_deducted_inr)  || 0,
  };
}

function computeStats(transactions, fy) {
  const filtered = (fy === "all" ? transactions : transactions.filter(t => t.financial_year === fy))
    .map(normalise);

  let totalInvested = 0, totalTDS = 0, realisedPnL = 0;
  const holdings = {};

  filtered.forEach(t => {
    const val = t.total_value_inr > 0
  ? t.total_value_inr
  : t.quantity * t.price_per_unit_inr;
    const key = t.asset_symbol;
    if (!holdings[key]) holdings[key] = { symbol: key, name: t.asset_name || key, type: t.asset_type || "Crypto", quantity: 0, totalCost: 0 };

    if (["Buy", "Transfer In", "Airdrop", "Mining", "Staking Reward", "Gift Received"].includes(t.transaction_type)) {
      holdings[key].quantity  += t.quantity;
      holdings[key].totalCost += val;
      totalInvested           += val;
    }
    if (["Sell", "Gift Sent", "Transfer Out"].includes(t.transaction_type)) {
      const avgCost   = holdings[key].quantity > 0 ? holdings[key].totalCost / holdings[key].quantity : 0;
      const costBasis = avgCost * t.quantity;
      realisedPnL            += val - costBasis;
      holdings[key].quantity  = Math.max(0, holdings[key].quantity  - t.quantity);
      holdings[key].totalCost = Math.max(0, holdings[key].totalCost - costBasis);
    }
    totalTDS += t.tds_deducted_inr;
  });

  const holdingsList = Object.values(holdings)
    .filter(h => h.quantity > 0.000001)
    .map(h => ({ ...h, avgBuyPrice: h.quantity > 0 ? h.totalCost / h.quantity : 0 }))
    .sort((a, b) => b.totalCost - a.totalCost);

  return {
    totalInvested,
    totalValue: holdingsList.reduce((s, h) => s + h.totalCost, 0),
    realisedPnL,
    totalTDS,
    holdings: holdingsList,
  };
}

function platformChart(transactions) {
  const map = {};
  transactions.map(normalise).forEach(t => {
    const p = t.platform || "Unknown";
    map[p] = (map[p] || 0) + t.total_value_inr;
  });
  return Object.entries(map)
    .filter(([, v]) => v > 0)          // ← skip zero-value platforms
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));
}

const fmt = (v) => `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

// Pure CSS horizontal bar chart — no Recharts layout bugs
function PlatformChart({ data }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-gray-600 text-sm text-center">
          No platform data yet<br />
          <span className="text-xs text-gray-700">Add transactions with a platform name</span>
        </p>
      </div>
    );
  }

  const max = data[0].value;

  return (
    <div className="space-y-3 mt-2">
      {data.map((item, i) => (
        <div key={item.name}>
          {/* Label row */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-xs text-gray-400 truncate max-w-[120px]">{item.name}</span>
            </div>
            <span className="text-xs font-semibold text-white">{fmt(item.value)}</span>
          </div>
          {/* Bar */}
          <div className="h-2 rounded-full w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(2, (item.value / max) * 100)}%`,
                background: COLORS[i % COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fy, setFyState] = useState(() => localStorage.getItem(STORAGE_KEY) || "2025-26");

  const setFy = (val) => {
    localStorage.setItem(STORAGE_KEY, val);
    setFyState(val);
  };

  useEffect(() => {
    base44.entities.Transaction.list("-date", 1000)
      .then(data => { setTransactions(data); setLoading(false); })
      .catch(err => { console.error("Failed to load transactions:", err); setLoading(false); });
  }, []);

  const stats     = computeStats(transactions, fy);
  const chartData = platformChart(transactions.filter(t => fy === "all" || t.financial_year === fy));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Portfolio Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">All your VDA holdings at a glance</p>
        </div>
        <Select value={fy} onValueChange={setFy}>
          <SelectTrigger className="w-36 text-sm font-medium text-white" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.08)" }}>
            <SelectItem value="all" className="text-white">All Time</SelectItem>
            {FY_OPTIONS.map(f => <SelectItem key={f} value={f} className="text-white">FY {f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading portfolio...</p>
          </div>
        </div>
      ) : (
        <>
          <PortfolioSummary stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AssetHoldings holdings={stats.holdings} />
            </div>

            {/* Volume by Platform — pure CSS bars, no Recharts */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="font-bold text-white text-sm mb-5">Volume by Platform</h2>
              <PlatformChart data={chartData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}