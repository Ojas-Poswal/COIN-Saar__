import { useState } from "react";
import { ExternalLink, Star, Shield, TrendingUp, Globe } from "lucide-react";

const EXCHANGES = [
  // Indian
  {
    name: "WazirX",
    url: "https://wazirx.com",
    logo: "🇮🇳",
    region: "Indian",
    type: "CEX",
    rating: 4.2,
    fees: "0.2%",
    highlights: ["INR deposits/withdrawals", "NEFT/IMPS/UPI", "TDS auto-deducted", "1000+ pairs"],
    tags: ["Best for beginners", "INR support"],
    color: "border-blue-500/30",
    badge: "bg-blue-500/20 text-blue-400",
  },
  {
    name: "CoinDCX",
    url: "https://coindcx.com",
    logo: "🇮🇳",
    region: "Indian",
    type: "CEX",
    rating: 4.4,
    fees: "0.1%",
    highlights: ["UPI & bank transfer", "INR trading pairs", "Futures & staking", "Simple UI"],
    tags: ["Top Indian exchange", "Low fees"],
    color: "border-green-500/30",
    badge: "bg-green-500/20 text-green-400",
  },
  {
    name: "CoinSwitch",
    url: "https://coinswitch.co",
    logo: "🇮🇳",
    region: "Indian",
    type: "CEX",
    rating: 4.1,
    fees: "0.25%",
    highlights: ["INR support", "Easy KYC", "Tax report built-in", "100+ coins"],
    tags: ["Tax-friendly", "Beginner-friendly"],
    color: "border-purple-500/30",
    badge: "bg-purple-500/20 text-purple-400",
  },
  {
    name: "ZebPay",
    url: "https://zebpay.com",
    logo: "🇮🇳",
    region: "Indian",
    type: "CEX",
    rating: 4.0,
    fees: "0.15%",
    highlights: ["Oldest Indian exchange", "INR pairs", "Staking available", "API access"],
    tags: ["Trusted", "OG Indian exchange"],
    color: "border-yellow-500/30",
    badge: "bg-yellow-500/20 text-yellow-400",
  },
  {
    name: "Mudrex",
    url: "https://mudrex.com",
    logo: "🇮🇳",
    region: "Indian",
    type: "CEX",
    rating: 3.9,
    fees: "0.0%",
    highlights: ["0% trading fee", "Coin basket investing", "INR support", "SIP crypto"],
    tags: ["Zero fees", "SIP investing"],
    color: "border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-400",
  },
  // Global
  {
    name: "Binance",
    url: "https://binance.com",
    logo: "🌐",
    region: "Global",
    type: "CEX",
    rating: 4.7,
    fees: "0.1%",
    highlights: ["Largest exchange by volume", "600+ coins", "Futures & options", "Lowest fees"],
    tags: ["Most popular", "Widest selection"],
    color: "border-yellow-400/30",
    badge: "bg-yellow-400/20 text-yellow-300",
  },
  {
    name: "Coinbase",
    url: "https://coinbase.com",
    logo: "🌐",
    region: "Global",
    type: "CEX",
    rating: 4.5,
    fees: "0.4%",
    highlights: ["Most trusted global CEX", "NASDAQ listed", "Coinbase Pro", "US-regulated"],
    tags: ["Most trusted", "US regulated"],
    color: "border-blue-400/30",
    badge: "bg-blue-400/20 text-blue-300",
  },
  {
    name: "Kraken",
    url: "https://kraken.com",
    logo: "🌐",
    region: "Global",
    type: "CEX",
    rating: 4.5,
    fees: "0.16%",
    highlights: ["Strong security record", "Margin trading", "Staking rewards", "Fiat support"],
    tags: ["Best security", "Staking"],
    color: "border-purple-400/30",
    badge: "bg-purple-400/20 text-purple-300",
  },
  {
    name: "OKX",
    url: "https://okx.com",
    logo: "🌐",
    region: "Global",
    type: "CEX",
    rating: 4.4,
    fees: "0.08%",
    highlights: ["Low fees", "1000+ tokens", "Web3 wallet built-in", "NFT marketplace"],
    tags: ["Low fees", "NFT marketplace"],
    color: "border-indigo-400/30",
    badge: "bg-indigo-400/20 text-indigo-300",
  },
  {
    name: "Uniswap",
    url: "https://app.uniswap.org",
    logo: "🦄",
    region: "Global",
    type: "DEX",
    rating: 4.6,
    fees: "0.3%",
    highlights: ["Largest DEX", "No KYC needed", "1000s of tokens", "Ethereum & L2s"],
    tags: ["Best DEX", "No KYC"],
    color: "border-pink-400/30",
    badge: "bg-pink-400/20 text-pink-300",
  },
  {
    name: "OpenSea",
    url: "https://opensea.io",
    logo: "🌊",
    region: "Global",
    type: "NFT",
    rating: 4.3,
    fees: "2.5%",
    highlights: ["Largest NFT marketplace", "Ethereum, Polygon, Solana", "Auctions & fixed price"],
    tags: ["Best for NFTs", "Most NFT volume"],
    color: "border-teal-400/30",
    badge: "bg-teal-400/20 text-teal-300",
  },
];

const REGION_FILTERS = ["All", "Indian", "Global"];
const TYPE_FILTERS = ["All", "CEX", "DEX", "NFT"];

export default function Exchanges() {
  const [region, setRegion] = useState("All");
  const [type, setType] = useState("All");

  const filtered = EXCHANGES.filter(e =>
    (region === "All" || e.region === region) &&
    (type === "All" || e.type === type)
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Buy & Sell</h1>
        <p className="text-gray-400 text-sm mt-0.5">Best exchanges & marketplaces to trade your crypto and NFTs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {REGION_FILTERS.map(f => (
            <button key={f} onClick={() => setRegion(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${region === f ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"}`}>
              {f === "Indian" ? "🇮🇳 Indian" : f === "Global" ? "🌐 Global" : f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {TYPE_FILTERS.map(f => (
            <button key={f} onClick={() => setType(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${type === f ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Exchange grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(ex => (
          <a key={ex.name} href={ex.url} target="_blank" rel="noopener noreferrer"
            className={`block rounded-xl bg-gray-900 border ${ex.color} hover:bg-gray-800 transition-all group p-5`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-xl">
                  {ex.logo}
                </div>
                <div>
                  <p className="text-white font-bold text-sm group-hover:text-orange-400 transition-colors">{ex.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ex.badge}`}>{ex.type}</span>
                    <span className="text-xs text-gray-500">{ex.region}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-orange-400 transition-colors" />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-3 h-3 ${s <= Math.round(ex.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
                ))}
              </div>
              <span className="text-xs text-gray-400">{ex.rating}/5</span>
              <span className="text-xs text-gray-600 ml-auto">Fees: {ex.fees}</span>
            </div>

            <ul className="space-y-1 mb-3">
              {ex.highlights.map(h => (
                <li key={h} className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-1 h-1 rounded-full bg-gray-600 flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-1.5">
              {ex.tags.map(t => (
                <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">{t}</span>
              ))}
            </div>
          </a>
        ))}
      </div>

      <div className="rounded-xl bg-gray-900 border border-gray-800 p-4 flex items-start gap-3">
        <Shield className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-500">
          Always do your own research before using any exchange. VDATrack does not endorse any platform. Remember to keep records of all your trades for accurate tax reporting. All trades on Indian exchanges are subject to 1% TDS deduction.
        </p>
      </div>
    </div>
  );
}