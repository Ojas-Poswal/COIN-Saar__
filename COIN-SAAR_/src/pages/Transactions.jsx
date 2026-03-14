import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import TransactionForm from "@/components/transactions/TransactionForm";
import CSVImport from "@/components/transactions/CSVImport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Pencil, Trash2, Search } from "lucide-react";
import { format } from "date-fns";

const FY_OPTIONS = ["all", "2025-26", "2024-25", "2023-24", "2022-23"];
const TYPE_COLORS = {
  Buy: "bg-green-500/20 text-green-400",
  Sell: "bg-red-500/20 text-red-400",
  "Transfer In": "bg-blue-500/20 text-blue-400",
  "Transfer Out": "bg-orange-500/20 text-orange-400",
  Airdrop: "bg-purple-500/20 text-purple-400",
  Mining: "bg-yellow-500/20 text-yellow-400",
  "Staking Reward": "bg-teal-500/20 text-teal-400",
  "Gift Received": "bg-pink-500/20 text-pink-400",
  "Gift Sent": "bg-rose-500/20 text-rose-400",
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [fy, setFy] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const load = () => {
    setLoading(true);
    base44.entities.Transaction.list("-date", 500).then(data => {
      setTransactions(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    setSaving(true);
    if (editing) {
      await base44.entities.Transaction.update(editing.id, data);
    } else {
      await base44.entities.Transaction.create(data);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    await base44.entities.Transaction.delete(id);
    load();
  };

  const filtered = transactions.filter(t => {
    const matchFY = fy === "all" || t.financial_year === fy;
    const matchType = typeFilter === "all" || t.transaction_type === typeFilter;
    const matchSearch = !search || t.asset_symbol?.toLowerCase().includes(search.toLowerCase()) || t.platform?.toLowerCase().includes(search.toLowerCase());
    return matchFY && matchType && matchSearch;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Track Every Trade</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Your Transaction History</h1>
          <p className="text-gray-500 text-sm mt-0.5">Every buy, sell, and transfer — recorded on the blockchain, tracked by CoinSaar • {transactions.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCSV(true)} variant="outline" className="text-sm font-medium" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Upload className="w-4 h-4 mr-1.5" /> Import CSV
          </Button>
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #6c47ff, #a855f7)" }}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search asset, platform..."
            className="pl-8 text-white text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
        <Select value={fy} onValueChange={setFy}>
          <SelectTrigger className="w-32 text-white text-sm font-medium" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.08)" }}>
            {FY_OPTIONS.map(f => <SelectItem key={f} value={f} className="text-white">{f === "all" ? "All FY" : `FY ${f}`}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 text-white text-sm font-medium" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.08)" }}>
            <SelectItem value="all" className="text-white">All Types</SelectItem>
            {["Buy", "Sell", "Transfer In", "Transfer Out", "Airdrop", "Mining", "Staking Reward", "Gift Received", "Gift Sent"].map(t => (
              <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                {["Date", "Asset", "Type", "Qty", "Price (₹)", "Total (₹)", "Fee (₹)", "TDS (₹)", "Platform", "FY", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-500">No transactions found</td></tr>
              ) : filtered.map(t => (
                <tr key={t.id} className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                    {t.date ? format(new Date(t.date), "dd MMM yyyy") : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white font-semibold">{t.asset_symbol}</p>
                    <p className="text-xs text-gray-500">{t.asset_type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[t.transaction_type] || "bg-gray-700 text-gray-300"}`}>
                      {t.transaction_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{Number(t.quantity).toFixed(6)}</td>
                  <td className="px-4 py-3 text-gray-300">{Number(t.price_per_unit_inr).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-white font-medium">{Number(t.total_value_inr).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-gray-400">{Number(t.fee_inr).toFixed(2) || "0.00"}</td>
                  <td className="px-4 py-3 text-orange-400">{Number(t.tds_deducted_inr).toFixed(2) || "0.00"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{t.platform || "-"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{t.financial_year || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditing(t); setShowForm(true); }}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          transaction={editing}
          onSubmit={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          isLoading={saving}
        />
      )}
      {showCSV && <CSVImport onImported={load} onClose={() => setShowCSV(false)} />}
    </div>
  );
}