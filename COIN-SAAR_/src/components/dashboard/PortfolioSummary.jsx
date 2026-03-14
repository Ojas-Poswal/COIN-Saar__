import { TrendingUp, TrendingDown, Wallet, Activity, IndianRupee, Receipt } from "lucide-react";

export default function PortfolioSummary({ stats }) {
  const pnlPositive = (stats.realisedPnL || 0) >= 0;

  const cards = [
    {
      label: "Portfolio Value",
      value: `₹${Number(stats.totalValue).toLocaleString("en-IN", { maximumFractionDigits: 0 }) || "0"}`,
      sub: "Current holdings cost",
      icon: Wallet,
      gradient: "from-violet-600/20 to-violet-900/10",
      border: "border-violet-500/20",
      iconBg: "bg-violet-500/20",
      iconColor: "text-violet-400",
      valueColor: "text-violet-300",
    },
    {
      label: "Total Invested",
      value: `₹${Number(stats.totalInvested).toLocaleString("en-IN", { maximumFractionDigits: 0 }) || "0"}`,
      sub: "Across all assets",
      icon: IndianRupee,
      gradient: "from-blue-600/20 to-blue-900/10",
      border: "border-blue-500/20",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      valueColor: "text-blue-300",
    },
    {
      label: "Realised P&L",
      value: `${pnlPositive ? "+" : "-"}₹${Math.abs(Number(stats.realisedPnL) || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      sub: pnlPositive ? "Profit realised" : "Loss realised",
      icon: pnlPositive ? TrendingUp : TrendingDown,
      gradient: pnlPositive ? "from-emerald-600/20 to-emerald-900/10" : "from-red-600/20 to-red-900/10",
      border: pnlPositive ? "border-emerald-500/20" : "border-red-500/20",
      iconBg: pnlPositive ? "bg-emerald-500/20" : "bg-red-500/20",
      iconColor: pnlPositive ? "text-emerald-400" : "text-red-400",
      valueColor: pnlPositive ? "text-emerald-300" : "text-red-300",
    },
    {
      label: "TDS Deducted",
      value: `₹${Number(stats.totalTDS).toLocaleString("en-IN", { maximumFractionDigits: 0 }) || "0"}`,
      sub: "Claimable via ITR",
      icon: Receipt,
      gradient: "from-amber-600/20 to-amber-900/10",
      border: "border-amber-500/20",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
      valueColor: "text-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className={`rounded-2xl border bg-gradient-to-br ${card.gradient} ${card.border} p-5 relative overflow-hidden group`}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "radial-gradient(circle at top right, rgba(108,71,255,0.05), transparent)" }} />
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className={`text-2xl font-black ${card.valueColor} tracking-tight`}>{card.value}</p>
            <p className="text-xs text-gray-600 mt-1.5">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}