"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { loginUser } from "@/services/auth.api";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setMessage({
        type: "error",
        text: "Email and password are required.",
      });

      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      setMessage({
        type: "success",
        text: data.message || "Login successful.",
      });

      const user = data.user;

      // Role abhi select nahi hua
      if (!user.role) {
        router.replace("/onboarding/select-role");
        return;
      }

      // Creator role selected hai, lekin onboarding pending hai
      if (
        user.role === "creator" &&
        !user.onboardingCompleted
      ) {
        router.replace("/onboarding/creator");
        return;
      }

      // Business role selected hai, lekin onboarding pending hai
      if (
        user.role === "business" &&
        !user.onboardingCompleted
      ) {
        router.replace("/onboarding/business");
        return;
      }


      // Creator onboarding complete but plan not selected
      if (
        user.role === "creator" &&
        user.onboardingCompleted &&
        !user.planSelected
      ) {
        router.replace("/onboarding/select-plan");
        return;
      }

      // Business onboarding complete but plan not selected
      if (
        user.role === "business" &&
        user.onboardingCompleted &&
        !user.planSelected
      ) {
        router.replace("/onboarding/select-plan");
        return;
      }

      // Creator onboarding complete
      if (
        user.role === "creator" &&
        user.onboardingCompleted && 
        user.planSelected
      ) {
        router.replace("/creator/dashboard");
        return;
      }

      // Business onboarding complete
      if (
        user.role === "business" &&
        user.onboardingCompleted && 
        user.planSelected
      ) {
        router.replace("/business/dashboard");
        return;
      }

      // Admin
      if (user.role === "admin") {
        router.replace("/admin/dashboard");
        return;
      }

      router.replace("/");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Login failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[35%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Background Dots Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative w-full max-w-6xl min-h-[calc(100vh-6rem)] grid lg:grid-cols-12 rounded-3xl overflow-hidden border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl shadow-2xl shadow-violet-950/20">
        
        {/* Left Side Panel (Desktop AI Visualizer) */}
        <section className="lg:col-span-5 hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-violet-950/30 via-indigo-950/20 to-transparent relative border-r border-white/5">
          {/* Top Logo */}
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-bold text-white transition hover:opacity-90">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <Sparkles size={20} className="text-white animate-pulse" />
            </span>
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight">
              Trendora
            </span>
          </Link>

          {/* Core Info & Simulation */}
          <div className="space-y-8 my-auto">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-300 mb-6 uppercase tracking-wider">
                <Sparkles size={12} className="text-violet-400" /> Welcome Back
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white mb-4">
                Continue building your <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">online growth journey</span>.
              </h1>
              <p className="text-sm leading-relaxed text-zinc-400 max-w-md">
                Access your trends, generated scripts, saved content and weekly growth suggestions.
              </p>
            </div>

            {/* AI Mockup Card */}
            <div className="relative border border-white/10 rounded-2xl p-5 bg-[#08041c]/90 shadow-2xl overflow-hidden group hover:border-violet-500/30 transition-colors duration-500">
              {/* Top Bar of Console */}
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="text-[10px] text-zinc-500 font-mono ml-2">trendora-ai-visualizer_v1.0</span>
                </div>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono font-medium animate-pulse">ACTIVE</span>
              </div>

              {/* Console Output Fields */}
              <div className="space-y-4 font-mono text-[11px] leading-relaxed">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="text-zinc-500 mb-1">Incoming Trend Target:</div>
                  <div className="text-white flex items-center justify-between font-semibold">
                    <span>📈 Local SEO: Best Cafe in Patna</span>
                    <span className="text-cyan-400">+142% search vol</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="text-zinc-500 mb-1">Generated AI Hook:</div>
                  <div className="text-violet-300 italic">"Here are 3 secret spots in Patna that even locals don't..."</div>
                </div>

                {/* Growth Chart Preview */}
                <div className="pt-2">
                  <div className="flex justify-between items-end h-16 gap-1.5 px-2 border-b border-zinc-800">
                    <div className="bg-violet-500/10 w-full h-[25%] rounded-t-sm transition-all duration-500 group-hover:h-[35%]" />
                    <div className="bg-violet-500/20 w-full h-[40%] rounded-t-sm transition-all duration-500 group-hover:h-[45%]" />
                    <div className="bg-violet-500/30 w-full h-[35%] rounded-t-sm transition-all duration-500 group-hover:h-[50%]" />
                    <div className="bg-indigo-500/50 w-full h-[60%] rounded-t-sm transition-all duration-500 group-hover:h-[70%]" />
                    <div className="bg-indigo-500/70 w-full h-[80%] rounded-t-sm transition-all duration-500 group-hover:h-[85%]" />
                    <div className="bg-gradient-to-t from-indigo-500 to-cyan-400 w-full h-[90%] rounded-t-sm relative">
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-600 mt-2">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 border-t border-white/5 pt-4">
            Built for regional creators & local businesses.
          </div>
        </section>

        {/* Right Side Panel (Login Form) */}
        <section className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
          <div className="w-full max-w-md space-y-8">
            {/* Logo for mobile only */}
            <Link href="/" className="flex items-center gap-2.5 text-2xl font-bold text-white transition hover:opacity-90 lg:hidden mb-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600">
                <Sparkles size={18} className="text-white" />
              </span>
              <span>Trendora</span>
            </Link>

            {/* Header info */}
            <div>
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest block mb-2">
                WELCOME BACK
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Login to account
              </h2>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Enter your email and password to continue.
              </p>
            </div>

            {/* Message alerts */}
            {message.text && (
              <div
                className={`rounded-xl border p-4 text-sm flex items-start gap-3 backdrop-blur-md transition-all duration-300 ${
                  message.type === "success"
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "border-red-500/25 bg-red-500/10 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                }`}
              >
                <div className={`p-1 rounded-md shrink-0 ${
                  message.type === "success" ? "bg-emerald-500/20" : "bg-red-500/20"
                }`}>
                  {message.type === "success" ? (
                    <Sparkles size={16} className="text-emerald-400" />
                  ) : (
                    <span className="text-red-400 font-bold block leading-none w-4 h-4 text-center">!</span>
                  )}
                </div>
                <div>{message.text}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="dilshad@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-zinc-400 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-violet-400 hover:text-violet-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 pr-12 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-4 font-semibold text-white transition hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] transition-all duration-300 overflow-hidden"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-violet-400 hover:text-violet-300 transition underline decoration-violet-500/40 hover:decoration-violet-400"
              >
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}