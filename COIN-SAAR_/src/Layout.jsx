import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, ArrowLeftRight, FileText, Crown, Menu, X, LogOut, Wallet, Store, Zap, ChevronRight
} from "lucide-react";

const navItems = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "Transactions", page: "Transactions", icon: ArrowLeftRight },
  { label: "My Wallets", page: "Wallets", icon: Wallet },
  { label: "Buy & Sell", page: "Exchanges", icon: Store },
  { label: "Tax Report", page: "TaxReport", icon: FileText },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen text-white flex" style={{ background: "#0a0a0f" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        :root { --brand: #6c47ff; --brand2: #a855f7; }
        body { background: #0a0a0f; }

        .cs-gradient-text {
          background: linear-gradient(135deg, #6c47ff 0%, #a855f7 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cs-nav-glow:hover {
          box-shadow: 0 0 20px rgba(108, 71, 255, 0.15);
        }
        .cs-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(10px);
        }
        .cs-sidebar {
          background: rgba(10,10,20,0.95);
          border-right: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
        }
        .cs-active-nav {
          background: linear-gradient(135deg, rgba(108,71,255,0.2) 0%, rgba(168,85,247,0.1) 100%);
          border: 1px solid rgba(108,71,255,0.3);
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(108,71,255,0.3); border-radius: 2px; }
      `}</style>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 cs-sidebar min-h-screen fixed left-0 top-0 z-30">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a52cd1548b006062caeeb8/9888c6d05_generated_image.png" 
              alt="CoinSaar Logo" 
              className="w-10 h-10 object-contain rounded-full" />
            <div>
              <p className="font-black text-white text-lg tracking-tight leading-none">CoinSaar</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "#6c47ff" }}>Portfolio and Tax</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">Menu</p>
          {navItems.map(({ label, page, icon: Icon }) => {
            const active = currentPageName === page;
            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                className={`cs-nav-glow flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active ? "cs-active-nav text-violet-300" : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-violet-400" : ""}`} />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-violet-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/5">
          <Link
            to={createPageUrl("Upgrade")}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold mb-3 transition-all ${
              currentPageName === "Upgrade"
                ? "cs-active-nav text-violet-300"
                : "text-yellow-400 hover:bg-yellow-400/10"
            }`}
            style={currentPageName !== "Upgrade" ? { background: "linear-gradient(135deg, rgba(234,179,8,0.1), rgba(234,179,8,0.05))", border: "1px solid rgba(234,179,8,0.2)" } : {}}
          >
            <Crown className="w-4 h-4" />
            Upgrade to Pro
            <span className="ml-auto text-xs bg-yellow-500 text-black font-bold px-1.5 py-0.5 rounded-md">₹499</span>
          </Link>

          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #6c47ff, #a855f7)" }}>
                {user.full_name?.[0] || user.email?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white font-semibold truncate">{user.full_name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button onClick={() => base44.auth.logout()} className="text-gray-600 hover:text-red-400 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(10,10,20,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2.5">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a52cd1548b006062caeeb8/9888c6d05_generated_image.png" 
            alt="CoinSaar Logo" 
            className="w-8 h-8 object-contain rounded-full" />
          <span className="font-black text-white text-base tracking-tight">CoinSaar</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-400">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-14" style={{ background: "rgba(10,10,20,0.98)", backdropFilter: "blur(20px)" }}>
          <nav className="px-3 py-4 space-y-1">
            {[...navItems, { label: "Upgrade to Pro", page: "Upgrade", icon: Crown }].map(({ label, page, icon: Icon }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}