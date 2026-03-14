import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, CheckCircle2, FileText, Shield, Download, IndianRupee, BarChart2, AlertCircle } from "lucide-react";

const FEATURES_FREE = [
  "Unlimited transaction tracking",
  "Portfolio dashboard",
  "Multi-platform support",
  "CSV import from exchanges",
  "Basic tax summary (total gains, TDS)",
];

const FEATURES_PREMIUM = [
  "Everything in Free",
  "Full ITR Schedule VDA breakdown",
  "Asset-wise capital gains report",
  "FIFO-based cost basis calculation",
  "TDS reconciliation with Form 26AS",
  "CA-verified filing notes & guidance",
  "Advance tax liability calculation",
  "Priority support",
];

export default function Upgrade() {
  const [user, setUser] = useState(null);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payRef, setPayRef] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      return base44.entities.UserSubscription.filter({ user_email: u.email });
    }).then(subs => {
      const active = subs.find(s => s.plan === "premium" && (!s.valid_until || new Date(s.valid_until) > new Date()));
      setSub(active || null);
      setLoading(false);
    });
  }, []);

  const handleActivate = async () => {
    if (!payRef.trim()) return;
    setSaving(true);
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    await base44.entities.UserSubscription.create({
      user_email: user.email,
      plan: "premium",
      valid_until: validUntil.toISOString(),
      payment_reference: payRef,
      amount_paid_inr: 499,
    });
    setSaving(false);
    setDone(true);
  };

  if (loading) return <div className="p-6 text-gray-400 text-center py-20">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5 mb-4">
          <Crown className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">VDATrack Premium</span>
        </div>
        <h1 className="text-3xl font-bold text-white">File your ITR without a CA</h1>
        <p className="text-gray-400 mt-2 text-sm max-w-lg mx-auto">Get a CA-quality VDA tax report that's ready to file directly with your Income Tax Return. One flat price, for the full financial year.</p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free */}
        <div className="rounded-2xl bg-gray-900 border border-gray-700 p-6">
          <p className="text-gray-400 text-sm font-medium mb-1">Free</p>
          <p className="text-3xl font-bold text-white mb-1">₹0</p>
          <p className="text-gray-500 text-xs mb-5">Forever free</p>
          <ul className="space-y-2.5 mb-6">
            {FEATURES_FREE.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button disabled className="w-full border-gray-700 text-gray-400" variant="outline">Current Plan</Button>
        </div>

        {/* Premium */}
        <div className="rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/50 p-6 relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">BEST VALUE</div>
          <p className="text-yellow-400 text-sm font-medium mb-1">Premium</p>
          <p className="text-3xl font-bold text-white mb-1">₹499</p>
          <p className="text-gray-400 text-xs mb-5">per financial year</p>
          <ul className="space-y-2.5 mb-6">
            {FEATURES_PREMIUM.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {sub ? (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold text-sm">Premium Active</p>
                <p className="text-gray-400 text-xs">Valid until {sub.valid_until ? new Date(sub.valid_until).toLocaleDateString("en-IN") : "—"}</p>
              </div>
            </div>
          ) : done ? (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <p className="text-green-400 font-semibold text-sm">Premium Activated! Refresh the page.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300">
                <p className="font-semibold mb-1">How to pay:</p>
                <p>UPI / Bank Transfer to <strong className="text-white">payments@vdatrack.in</strong> — Amount: ₹499. After payment, enter your UTR / transaction reference below to activate.</p>
              </div>
              <div>
                <Label className="text-gray-300 text-xs mb-1.5">Payment Reference (UTR / Transaction ID)</Label>
                <Input value={payRef} onChange={e => setPayRef(e.target.value)}
                  placeholder="Enter UTR or payment reference..."
                  className="bg-gray-800 border-gray-600 text-white text-sm" />
              </div>
              <Button onClick={handleActivate} disabled={saving || !payRef.trim()}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                <Crown className="w-4 h-4 mr-2" />
                {saving ? "Activating..." : "Activate Premium — ₹499/yr"}
              </Button>
              <p className="text-xs text-gray-500 text-center">Manual verification may take up to 24 hours</p>
            </div>
          )}
        </div>
      </div>

      {/* Why premium */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: "ITR-Ready Report", desc: "Exactly as required by Income Tax portal" },
          { icon: BarChart2, label: "FIFO Calculation", desc: "Correct cost basis per Indian CA standards" },
          { icon: Shield, label: "Sec 115BBH Compliant", desc: "30% flat tax with proper loss segregation" },
          { icon: IndianRupee, label: "TDS Reconciliation", desc: "Match with Form 26AS automatically" },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="rounded-xl bg-gray-900 border border-gray-800 p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
              <Icon className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-white text-xs font-semibold mb-1">{label}</p>
            <p className="text-gray-500 text-xs">{desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-400">
          VDATrack helps you prepare and organise your VDA tax data. This is not a substitute for professional CA advice. For complex cases (large portfolios, cross-border transactions, legal disputes), consult a qualified Chartered Accountant.
        </p>
      </div>
    </div>
  );
}