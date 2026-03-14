const TYPE_COLORS = {
  Crypto:     { bg: "bg-blue-500/15",   text: "text-blue-400",   dot: "bg-blue-400" },
  NFT:        { bg: "bg-purple-500/15", text: "text-purple-400", dot: "bg-purple-400" },
  Token:      { bg: "bg-emerald-500/15",text: "text-emerald-400",dot: "bg-emerald-400" },
  Stablecoin: { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400" },
  Other:      { bg: "bg-gray-500/15",   text: "text-gray-400",   dot: "bg-gray-400" },
};

const SYMBOL_COLORS = ["#6c47ff", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];

export default function AssetHoldings({ holdings }) {
  if (!holdings.length) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-gray-500 text-sm">No holdings yet. Add transactions to see your portfolio.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <h2 className="font-bold text-white text-sm">Current Holdings</h2>
        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">{holdings.length} assets</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Price</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => {
              const color = SYMBOL_COLORS[i % SYMBOL_COLORS.length];
              const tc = TYPE_COLORS[h.type] || TYPE_COLORS.Other;
              return (
                <tr key={i} className="transition-colors duration-150"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(108,71,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${color}40, ${color}20)`, border: `1px solid ${color}30` }}>
                        {h.symbol?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{h.symbol}</p>
                        <p className="text-xs text-gray-500">{h.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${tc.bg} ${tc.text}`}>
                      {h.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-white font-mono text-xs">{Number(h.quantity).toFixed(6)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-gray-400 text-xs">₹{Number(h.avgBuyPrice).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="font-bold text-white">₹{Number(h.totalCost).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}