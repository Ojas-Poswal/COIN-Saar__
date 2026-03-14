import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wallet, RefreshCw, Trash2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

const CHAINS = ["Ethereum", "Bitcoin", "BSC", "Polygon"];

const CHAIN_EXPLORERS = {
  Ethereum: "https://etherscan.io/address/",
  Bitcoin: "https://blockstream.info/address/",
  BSC: "https://bscscan.com/address/",
  Polygon: "https://polygonscan.com/address/",
};

const CHAIN_COLOR = {
  Ethereum: "bg-blue-500/20 text-blue-400",
  Bitcoin: "bg-orange-500/20 text-orange-400",
  BSC: "bg-yellow-500/20 text-yellow-400",
  Polygon: "bg-purple-500/20 text-purple-400",
};

const CURRENT_FY = "2024-25";

function getCurrentFY(date) {
  const d = date ? new Date(date) : new Date();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return month >= 4 ? `${year}-${String(year + 1).slice(2)}` : `${year - 1}-${String(year).slice(2)}`;
}

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", address: "", chain: "Ethereum" });
  const [saving, setSaving] = useState(false);
  const [syncResults, setSyncResults] = useState({});

  const load = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const ws = await base44.entities.Wallet.filter({ user_email: u.email });
    setWallets(ws);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.address.trim()) return;
    setSaving(true);
    await base44.entities.Wallet.create({ ...form, user_email: user.email });
    setForm({ label: "", address: "", chain: "Ethereum" });
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this wallet?")) return;
    await base44.entities.Wallet.delete(id);
    load();
  };

  const handleSync = async (wallet) => {
    setSyncing(wallet.id);
    setSyncResults(r => ({ ...r, [wallet.id]: null }));

    const prompt = `Fetch the last 20 on-chain transactions for the ${wallet.chain} wallet address: ${wallet.address}.
For each transaction return: date (ISO), asset_symbol, asset_name, asset_type (Crypto/NFT/Token/Stablecoin), transaction_type (Buy/Sell/Transfer In/Transfer Out/Airdrop/Mining/Staking Reward), quantity (number), price_per_unit_inr (approximate INR price at time of tx using historical rates), total_value_inr, fee_inr, tds_deducted_inr (0 for on-chain), platform (use "Wallet: ${wallet.address.slice(0, 8)}..."), financial_year (e.g. 2024-25 using Indian FY April-March).
Use real data if available. Only include meaningful token transfers. Skip dust/spam. Omit failed txs.`;

    const schema = {
      type: "object",
      properties: {
        transactions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string" },
              asset_symbol: { type: "string" },
              asset_name: { type: "string" },
              asset_type: { type: "string" },
              transaction_type: { type: "string" },
              quantity: { type: "number" },
              price_per_unit_inr: { type: "number" },
              total_value_inr: { type: "number" },
              fee_inr: { type: "number" },
              tds_deducted_inr: { type: "number" },
              platform: { type: "string" },
              financial_year: { type: "string" }
            }
          }
        }
      }
    };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: schema
    });

    const txs = result?.transactions || [];
    let imported = 0;
    for (const tx of txs) {
      if (tx.asset_symbol && tx.quantity && tx.transaction_type) {
        await base44.entities.Transaction.create({
          ...tx,
          quantity: parseFloat(tx.quantity) || 0,
          price_per_unit_inr: parseFloat(tx.price_per_unit_inr) || 0,
          total_value_inr: parseFloat(tx.total_value_inr) || 0,
          fee_inr: parseFloat(tx.fee_inr) || 0,
          tds_deducted_inr: parseFloat(tx.tds_deducted_inr) || 0,
        });
        imported++;
      }
    }

    await base44.entities.Wallet.update(wallet.id, { last_synced: new Date().toISOString() });
    setSyncResults(r => ({ ...r, [wallet.id]: { count: imported } }));
    setSyncing(null);
    load();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">My Wallets</h1>
          <p className="text-gray-400 text-sm mt-0.5">Add your crypto/NFT wallets to auto-import transactions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-orange-500 hover:bg-orange-600 text-white text-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Add Wallet
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl bg-gray-900 border border-gray-700 p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">Add Wallet Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-400 text-xs mb-1.5">Label (optional)</Label>
              <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. My MetaMask"
                className="bg-gray-800 border-gray-700 text-white text-sm" />
            </div>
            <div>
              <Label className="text-gray-400 text-xs mb-1.5">Blockchain</Label>
              <Select value={form.chain} onValueChange={v => setForm(f => ({ ...f, chain: v }))}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {CHAINS.map(c => <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-400 text-xs mb-1.5">Wallet Address *</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="0x... or bc1..."
                className="bg-gray-800 border-gray-700 text-white text-sm font-mono" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={saving || !form.address.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm">
              {saving ? "Saving..." : "Save Wallet"}
            </Button>
            <Button onClick={() => setShowForm(false)} variant="outline"
              className="border-gray-700 text-gray-400 hover:bg-gray-800 text-sm">Cancel</Button>
          </div>
        </div>
      )}

      {/* Wallet list */}
      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading wallets...</div>
      ) : wallets.length === 0 ? (
        <div className="rounded-xl bg-gray-900 border border-dashed border-gray-700 p-12 text-center">
          <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No wallets added yet.</p>
          <p className="text-gray-600 text-xs mt-1">Add your Ethereum, Bitcoin, BSC or Polygon wallet to import transactions automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wallets.map(w => (
            <div key={w.id} className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{w.label || "Unnamed Wallet"}</p>
                    <p className="text-gray-400 font-mono text-xs mt-0.5 break-all">{w.address}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CHAIN_COLOR[w.chain]}`}>{w.chain}</span>
                      {w.last_synced && (
                        <span className="text-xs text-gray-500">Last synced: {new Date(w.last_synced).toLocaleDateString("en-IN")}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`${CHAIN_EXPLORERS[w.chain]}${w.address}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:bg-gray-800 text-xs">
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> Explorer
                    </Button>
                  </a>
                  <Button onClick={() => handleSync(w)} disabled={syncing === w.id}
                    size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
                    <RefreshCw className={`w-3.5 h-3.5 mr-1 ${syncing === w.id ? "animate-spin" : ""}`} />
                    {syncing === w.id ? "Importing..." : "Sync Txns"}
                  </Button>
                  <button onClick={() => handleDelete(w.id)}
                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {syncResults[w.id] !== undefined && syncResults[w.id] !== null && (
                <div className="mt-3 flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <p className="text-green-400 text-sm">{syncResults[w.id].count} transactions imported successfully.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}