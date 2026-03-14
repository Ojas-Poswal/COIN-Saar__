import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import TaxSummaryCards from "@/components/tax/TaxSummaryCards";
import ITRScheduleVDA from "@/components/tax/ITRScheduleVDA";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Lock, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const FY_OPTIONS = ["2025-26", "2024-25", "2023-24", "2022-23", "2021-22"];

function computeTax(transactions, fy) {
  const filtered = transactions.filter(t => t.financial_year === fy);

  // Build cost basis using FIFO per asset
  const lots = {}; // symbol -> [{qty, costPerUnit}]
  const assetMap = {};

  const buys = filtered.filter(t => ["Buy", "Airdrop", "Mining", "Staking Reward", "Gift Received", "Transfer In"].includes(t.transaction_type));
  const sells = filtered.filter(t => ["Sell", "Gift Sent"].includes(t.transaction_type));

  // All transactions sorted by date
  const allSorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

  allSorted.forEach(t => {
    const key = t.asset_symbol;
    if (!lots[key]) lots[key] = [];
    if (!assetMap[key]) assetMap[key] = { symbol: key, type: t.asset_type || "Crypto", saleConsideration: 0, costOfAcquisition: 0, tds: 0 };

    if (["Buy", "Airdrop", "Mining", "Staking Reward", "Gift Received", "Transfer In"].includes(t.transaction_type)) {
      lots[key].push({ qty: t.quantity, costPerUnit: t.price_per_unit_inr || 0 });
    }

    if (["Sell", "Gift Sent"].includes(t.transaction_type)) {
      let qtyToSell = t.quantity;
      let costBasis = 0;
      const sale = (t.total_value_inr || t.quantity * t.price_per_unit_inr);

      while (qtyToSell > 0 && lots[key].length > 0) {
        const lot = lots[key][0];
        const used = Math.min(lot.qty, qtyToSell);
        costBasis += used * lot.costPerUnit;
        lot.qty -= used;
        qtyToSell -= used;
        if (lot.qty <= 0) lots[key].shift();
      }

      assetMap[key].saleConsideration += sale;
      assetMap[key].costOfAcquisition += costBasis;
      assetMap[key].tds += (t.tds_deducted_inr || 0);
    }
  });

  const assetBreakdown = Object.values(assetMap)
    .filter(a => a.saleConsideration > 0)
    .map(a => ({
      ...a,
      netIncome: a.saleConsideration - a.costOfAcquisition,
      tax: Math.max(0, (a.saleConsideration - a.costOfAcquisition) * 0.30),
    }));

  const totalGains = assetBreakdown.reduce((s, a) => s + a.netIncome, 0);
  const taxPayable = Math.max(0, totalGains * 0.30);
  const totalTDS = filtered.reduce((s, t) => s + (t.tds_deducted_inr || 0), 0);

  return { totalGains, taxPayable, totalTDS, assetBreakdown };
}

export default function TaxReport() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fy, setFy] = useState("2025-26");
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Transaction.list("-date", 1000),
      base44.auth.me().then(u =>
        base44.entities.UserSubscription.filter({ user_email: u.email, plan: "premium" })
      )
    ]).then(([txs, subs]) => {
      setTransactions(txs);
      const validSub = subs.find(s => !s.valid_until || new Date(s.valid_until) > new Date());
      setIsPremium(!!validSub);
      setLoading(false);
    });
  }, []);

  const taxData = computeTax(transactions, fy);

  if (loading) return <div className="p-6 text-gray-400 text-center py-20">Calculating tax...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Compliance Made Simple</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Tax Report</h1>
          <p className="text-gray-500 text-sm mt-0.5">From blockchain creation to ITR filing — Section 115BBH compliance in seconds</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={fy} onValueChange={setFy}>
            <SelectTrigger className="w-36 text-white text-sm font-medium" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.08)" }}>
              {FY_OPTIONS.map(f => <SelectItem key={f} value={f} className="text-white">FY {f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Free summary always visible */}
      <TaxSummaryCards taxData={taxData} />

      {/* Premium gate for detailed report */}
      {!isPremium ? (
        <div className="relative rounded-2xl overflow-hidden border border-yellow-500/30">
          {/* Blurred preview */}
          <div className="filter blur-sm pointer-events-none select-none opacity-40 p-6">
            <ITRScheduleVDA taxData={taxData} financialYear={fy} />
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-sm">
            <div className="text-center max-w-sm px-6">
              <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
              <p className="text-gray-400 text-sm mb-1">
                Get the full <strong className="text-white">ITR-ready Schedule VDA</strong> report — asset-wise breakdown, exact tax calculation, TDS reconciliation and CA-verified filing notes.
              </p>
              <p className="text-yellow-400 font-bold text-lg my-3">₹499 / year</p>
              <Link to={createPageUrl("Upgrade")}>
                <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8">
                  <Crown className="w-4 h-4 mr-2" /> Unlock Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <ITRScheduleVDA taxData={taxData} financialYear={fy} />
      )}
    </div>
  );
}