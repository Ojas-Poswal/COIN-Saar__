import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) { setError("Email and password are required"); return; }
    if (isRegister && !name)  { setError("Name is required"); return; }
    setLoading(true);
    setError("");
    try {
      if (isRegister) {
        await base44.auth.register(email, password, name);
      } else {
        await base44.auth.login(email, password);
      }
      navigate("/Dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
      <div className="w-full max-w-sm p-8 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⚡</div>
          <h1 className="text-2xl font-black text-white">CoinSaar</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRegister ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {/* Fields */}
        {isRegister && (
          <div className="mb-3">
            <label className="text-gray-400 text-xs mb-1 block">Your Name</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              placeholder="Riya Rani"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
        )}

        <div className="mb-3">
          <label className="text-gray-400 text-xs mb-1 block">Email</label>
          <input
            className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-5">
          <label className="text-gray-400 text-xs mb-1 block">Password</label>
          <input
            className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            placeholder="Minimum 8 characters"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl text-red-400 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #6c47ff, #a855f7)" }}
        >
          {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
        </button>

        {/* Toggle */}
        <p className="text-gray-500 text-xs text-center mt-5">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <button
            className="text-violet-400 hover:text-violet-300 font-medium"
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
          >
            {isRegister ? "Sign in" : "Register free"}
          </button>
        </p>
      </div>
    </div>
  );
}