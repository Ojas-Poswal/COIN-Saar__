import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Zap, Shield, TrendingUp, IndianRupee, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0f" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .cs-gradient-text {
          background: linear-gradient(135deg, #6c47ff 0%, #a855f7 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cs-glow {
          box-shadow: 0 0 60px rgba(108, 71, 255, 0.3);
        }
        .cs-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Floating nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300"
        style={{
          background: scrollY > 50 ? "rgba(10,10,20,0.95)" : "transparent",
          borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,0.06)" : "none",
          backdropFilter: scrollY > 50 ? "blur(20px)" : "none"
        }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a52cd1548b006062caeeb8/9888c6d05_generated_image.png" 
              alt="CoinSaar Logo" 
              className="w-9 h-9 object-contain rounded-full" />
            <span className="font-black text-white text-lg tracking-tight">CoinSaar</span>
          </div>
          <Link to={createPageUrl("Dashboard")}>
            <button className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6c47ff, #a855f7)" }}>
              Launch App
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full cs-float opacity-20"
            style={{ background: "radial-gradient(circle, #6c47ff, transparent)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full cs-float opacity-20"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)", animationDelay: "2s" }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full cs-float opacity-15"
            style={{ background: "radial-gradient(circle, #ec4899, transparent)", animationDelay: "4s" }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-gray-300">India's First Story-Driven Crypto Tax Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
              Your <span className="cs-gradient-text">Crypto Journey</span><br />
              Starts With Trust
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              In a world where digital assets are reshaping finance, staying compliant shouldn't be complicated. CoinSaar simplifies Indian crypto taxation — from your first trade to your ITR filing.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to={createPageUrl("Dashboard")}>
                <button className="px-8 py-4 rounded-xl font-bold text-base text-white flex items-center gap-2 cs-glow transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #6c47ff, #a855f7)" }}>
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <a href="#story">
                <button className="px-8 py-4 rounded-xl font-bold text-base text-white transition-all hover:bg-white/10"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Read the Story
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Journey Section */}
      <section id="story" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-5xl font-black text-white mb-4">
              The Crypto <span className="cs-gradient-text">Journey</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-gray-500 text-lg">
              From blockchain creation to your tax return
            </motion.p>
          </div>

          <div className="space-y-32">
            {/* 1. Mining/Creation */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-80 rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.1), rgba(168,85,247,0.05))", border: "1px solid rgba(108,71,255,0.2)" }}>
                <motion.img
                  initial={{ scale: 1.1, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  src="https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80"
                  alt="Bitcoin Mining"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center">
                  <div className="text-9xl">₿</div>
                </motion.div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Step 1: Creation</span>
                </div>
                <h3 className="text-4xl font-black text-white mb-4">Mining & Blockchain</h3>
                <p className="text-gray-400 text-lg leading-relaxed">Miners solve cryptographic puzzles. New blocks are created. Bitcoin is born — no bank, just math.</p>
              </div>
            </motion.div>

            {/* 2. Exchange/Distribution */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 2: Distribution</span>
                </div>
                <h3 className="text-4xl font-black text-white mb-4">Exchange Markets</h3>
                <p className="text-gray-400 text-lg leading-relaxed">Coins flow to exchanges. Buyers meet sellers. Mumbai connects to Iceland in milliseconds.</p>
              </div>
              <div className="relative h-80 rounded-3xl overflow-hidden order-1 lg:order-2" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))", border: "1px solid rgba(59,130,246,0.2)" }}>
                <motion.img
                  initial={{ scale: 1.1, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  src="https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800&q=80"
                  alt="Crypto Exchange"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center gap-8">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="text-8xl">
                    💱
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="text-7xl">
                    🌐
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* 3. Trading */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-80 rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.1), rgba(219,39,119,0.05))", border: "1px solid rgba(236,72,153,0.2)" }}>
                <motion.img
                  initial={{ scale: 1.1, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80"
                  alt="Crypto Trading Charts"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/50 to-transparent" />
                <motion.div
                  animate={{ y: [-20, 20, -20] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center text-9xl opacity-80">
                  📊
                </motion.div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-1.5 mb-4">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                  <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Step 3: Trading</span>
                </div>
                <h3 className="text-4xl font-black text-white mb-4">24/7 Markets</h3>
                <p className="text-gray-400 text-lg leading-relaxed">Buy. Sell. Stake. Trade. The market never sleeps — and every move is recorded on-chain.</p>
              </div>
            </motion.div>

            {/* 4. Taxation */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Step 4: Compliance</span>
                </div>
                <h3 className="text-4xl font-black text-white mb-4">Indian Tax Reality</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-3">30% tax. 1% TDS. FIFO calculations. Schedule VDA reports.</p>
                <p className="text-amber-400 font-semibold">This is where most traders get stuck.</p>
              </div>
              <div className="relative h-80 rounded-3xl overflow-hidden order-1 lg:order-2" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.05))", border: "1px solid rgba(245,158,11,0.2)" }}>
                <motion.img
                  initial={{ scale: 1.1, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80"
                  alt="Tax Documents"
                  className="absolute inset-0 w-full h-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/50 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-9xl opacity-90">
                    🧾
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-8 right-8 bg-amber-500/20 border border-amber-500/40 rounded-2xl px-6 py-3">
                    <span className="text-3xl font-black text-amber-300">30%</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* 5. CoinSaar Solution */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative rounded-3xl p-12 text-center overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))", border: "2px solid rgba(16,185,129,0.3)" }}>
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(16,185,129,0.4), transparent)" }}>
                </motion.div>
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Step 5: Your Solution</span>
                </div>
                <div className="text-8xl mb-6">⚡</div>
                <h3 className="text-5xl font-black text-white mb-4">CoinSaar</h3>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">We handle the journey from blockchain to ITR — so you stay compliant, confident, and in control.</p>
                <Link to={createPageUrl("Dashboard")}>
                  <button className="px-10 py-4 rounded-xl font-bold text-lg text-white flex items-center gap-3 mx-auto cs-glow transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #6c47ff, #a855f7)" }}>
                    Start Your Journey
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Why CoinSaar?</h2>
            <p className="text-lg text-gray-400">Everything you need to stay tax-compliant in India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Auto Transaction Import", desc: "CSV upload from WazirX, CoinDCX, Binance and more. Or add wallet addresses for on-chain sync." },
              { icon: IndianRupee, title: "FIFO Cost Calculation", desc: "Accurate cost basis using First-In-First-Out method as per Indian CA standards." },
              { icon: FileText, title: "ITR-Ready Reports", desc: "Generate Schedule VDA breakdown for direct filing with your Income Tax Return." },
              { icon: Shield, title: "1% TDS Tracking", desc: "Auto-reconcile TDS deducted by exchanges with Form 26AS for accurate claims." },
              { icon: Sparkles, title: "Premium for ₹499/yr", desc: "Full tax reports, asset-wise breakdown, and CA-verified filing notes included." },
              { icon: CheckCircle2, title: "100% Indian Compliant", desc: "Built specifically for Section 115BBH and Indian crypto tax regulations." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="rounded-2xl p-6 transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.2), rgba(168,85,247,0.1))" }}>
                  <f.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}>
            <h2 className="text-5xl font-black text-white mb-6 leading-tight">
              Ready to Take Control<br />of Your <span className="cs-gradient-text">Crypto Taxes</span>?
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of Indian crypto investors who trust CoinSaar for stress-free tax compliance.
            </p>
            <Link to={createPageUrl("Dashboard")}>
              <button className="px-10 py-5 rounded-xl font-bold text-lg text-white flex items-center gap-3 mx-auto cs-glow transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #6c47ff, #a855f7)" }}>
                Launch CoinSaar
                <ArrowRight className="w-6 h-6" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a52cd1548b006062caeeb8/9888c6d05_generated_image.png" 
              alt="CoinSaar Logo" 
              className="w-7 h-7 object-contain rounded-full" />
            <span className="font-black text-white text-sm">CoinSaar</span>
          </div>
          <p className="text-xs text-gray-600">
            © 2026 CoinSaar. Built for Indian crypto investors. Not financial or tax advice — consult a CA for complex cases.
          </p>
        </div>
      </footer>
    </div>
  );
}