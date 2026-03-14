import { AlertCircle, TrendingUp, Receipt, IndianRupee } from "lucide-react";

export default function TaxSummaryCards({ taxData }) {
  const cards = [
    {
      label: "Total Gains (Taxable)",
      value: `₹${taxData.totalGains?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || "0"}`,
      sub: "From all Sell transactions",
      icon: TrendingUp,
      color: taxData.totalGains >= 0 ? "text-green-400" : "text-red-400",
      bg: "bg-gray-800 border-gray-700",
    },
    {
      label: "Tax Payable @ 30%",
      value: `₹${taxData.taxPayable?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || "0"}`,
      sub: "u/s 115BBH Income Tax Act",
      icon: Receipt,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
    {
      label: "Total TDS Deducted",
      value: `₹${taxData.totalTDS?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) || "0"}`,
      sub: "1% deducted by exchanges",
      icon: IndianRupee,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
    {
      label: "Net Tax After TDS",
      value: `₹${Math.max(0, (taxData.taxPayable || 0) - (taxData.totalTDS || 0)).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      sub: "Balance payable with ITR",
      icon: AlertCircle,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className={`rounded-xl border p-4 ${card.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">{card.label}</p>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}