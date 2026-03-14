import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

const PLATFORMS = ["WazirX", "CoinDCX", "CoinSwitch", "ZebPay", "Binance", "Kraken", "Uniswap", "OpenSea", "Other"];
const TX_TYPES = ["Buy", "Sell", "Transfer In", "Transfer Out", "Airdrop", "Mining", "Staking Reward", "Gift Received", "Gift Sent"];
const ASSET_TYPES = ["Crypto", "NFT", "Token", "Stablecoin", "Other"];

const CURRENT_FY = () => {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 3 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
};

export default function TransactionForm({ transaction, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 16),
    asset_symbol: "",
    asset_name: "",
    asset_type: "Crypto",
    transaction_type: "Buy",
    quantity: "",
    price_per_unit_inr: "",
    total_value_inr: "",
    fee_inr: "0",
    tds_deducted_inr: "0",
    platform: "",
    notes: "",
    financial_year: CURRENT_FY(),
    ...transaction,
  });

  const set = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      // Auto-calc total
      if (k === "quantity" || k === "price_per_unit_inr") {
        const q = parseFloat(k === "quantity" ? v : next.quantity) || 0;
        const p = parseFloat(k === "price_per_unit_inr" ? v : next.price_per_unit_inr) || 0;
        next.total_value_inr = (q * p).toFixed(2);
        // Auto TDS for sell
        if (next.transaction_type === "Sell") {
          next.tds_deducted_inr = (q * p * 0.01).toFixed(2);
        }
      }
      if (k === "transaction_type" && v === "Sell") {
        const q = parseFloat(next.quantity) || 0;
        const p = parseFloat(next.price_per_unit_inr) || 0;
        next.tds_deducted_inr = (q * p * 0.01).toFixed(2);
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      quantity: parseFloat(form.quantity),
      price_per_unit_inr: parseFloat(form.price_per_unit_inr),
      total_value_inr: parseFloat(form.total_value_inr),
      fee_inr: parseFloat(form.fee_inr) || 0,
      tds_deducted_inr: parseFloat(form.tds_deducted_inr) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">{transaction ? "Edit Transaction" : "Add Transaction"}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300 text-xs mb-1">Date & Time *</Label>
              <Input type="datetime-local" value={form.date} onChange={e => set("date", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white text-sm" required />
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1">Financial Year</Label>
              <Input value={form.financial_year} onChange={e => set("financial_year", e.target.value)}
                placeholder="2024-25" className="bg-gray-800 border-gray-700 text-white text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300 text-xs mb-1">Asset Symbol *</Label>
              <Input value={form.asset_symbol} onChange={e => set("asset_symbol", e.target.value.toUpperCase())}
                placeholder="BTC, ETH..." className="bg-gray-800 border-gray-700 text-white text-sm" required />
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1">Asset Name</Label>
              <Input value={form.asset_name} onChange={e => set("asset_name", e.target.value)}
                placeholder="Bitcoin" className="bg-gray-800 border-gray-700 text-white text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300 text-xs mb-1">Asset Type</Label>
              <Select value={form.asset_type} onValueChange={v => set("asset_type", v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {ASSET_TYPES.map(t => <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1">Transaction Type *</Label>
              <Select value={form.transaction_type} onValueChange={v => set("transaction_type", v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {TX_TYPES.map(t => <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-gray-300 text-xs mb-1">Quantity *</Label>
              <Input type="number" step="any" value={form.quantity} onChange={e => set("quantity", e.target.value)}
                placeholder="0.001" className="bg-gray-800 border-gray-700 text-white text-sm" required />
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1">Price/Unit (₹) *</Label>
              <Input type="number" step="any" value={form.price_per_unit_inr} onChange={e => set("price_per_unit_inr", e.target.value)}
                placeholder="0.00" className="bg-gray-800 border-gray-700 text-white text-sm" required />
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1">Total Value (₹)</Label>
              <Input type="number" step="any" value={form.total_value_inr} onChange={e => set("total_value_inr", e.target.value)}
                placeholder="0.00" className="bg-gray-800 border-gray-700 text-white text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-300 text-xs mb-1">Fee (₹)</Label>
              <Input type="number" step="any" value={form.fee_inr} onChange={e => set("fee_inr", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white text-sm" />
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1">TDS Deducted (₹) <span className="text-orange-400">1%</span></Label>
              <Input type="number" step="any" value={form.tds_deducted_inr} onChange={e => set("tds_deducted_inr", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white text-sm" />
            </div>
          </div>

          <div>
            <Label className="text-gray-300 text-xs mb-1">Platform</Label>
            <Select value={form.platform} onValueChange={v => set("platform", v)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm">
                <SelectValue placeholder="Select platform..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {PLATFORMS.map(p => <SelectItem key={p} value={p} className="text-white">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-300 text-xs mb-1">Notes</Label>
            <Input value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Optional notes..." className="bg-gray-800 border-gray-700 text-white text-sm" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800">Cancel</Button>
            <Button type="submit" disabled={isLoading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
              {isLoading ? "Saving..." : "Save Transaction"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}