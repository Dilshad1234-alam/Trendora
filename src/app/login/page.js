"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Sparkles,
  Check,
  WandSparkles,
  Flame,
  FileText,
  MessageSquareText,
  BarChart3,
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
    <main className="min-h-screen bg-white text-zinc-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/Trendora_Landing_Logo.png"
              alt="Trendora Logo"
              width={270}
              height={104}
              priority
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-800"
            >
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
        {/* Background glow */}
        <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">

            {/* Left Side — Dashboard Preview */}
            <div className="hidden lg:block">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm mb-7">
                <WandSparkles size={17} />
                Welcome back
              </div>

              <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                Continue building your
                <span className="block bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  online growth journey.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-8 text-zinc-600">
                Access your trends, generated scripts, saved content and
                weekly growth suggestions — all in one place.
              </p>

              {/* Benefits list */}
              <div className="mt-8 space-y-3">
                {[
                  "Access your saved hooks, scripts and captions",
                  "View your personalized daily growth plan",
                  "Continue from where you left off",
                  "Track your content performance",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check size={14} />
                    </span>
                    <p className="text-sm font-medium text-zinc-700">{benefit}</p>
                  </div>
                ))}
              </div>

              {/* Dashboard Preview Card */}
              <div className="mt-10 rounded-[2rem] border border-zinc-200 bg-white p-3 shadow-2xl shadow-violet-200/50">
                <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-[#f7f7fb]">
                  {/* Browser bar */}
                  <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-400" />
                      <span className="h-3 w-3 rounded-full bg-amber-400" />
                      <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="rounded-lg bg-zinc-100 px-5 py-2 text-xs text-zinc-500">
                      trendora.app/dashboard
                    </div>
                    <div className="w-14" />
                  </div>

                  {/* Dashboard body */}
                  <div className="grid gap-5 p-5 text-left md:grid-cols-[180px_1fr]">
                    <aside className="rounded-2xl bg-zinc-950 p-4 text-white">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Sparkles size={16} />
                        Trendora
                      </div>
                      <div className="mt-6 space-y-2 text-xs">
                        {["Dashboard", "AI Generators", "Daily Plan", "Saved"].map(
                          (item, index) => (
                            <div
                              key={item}
                              className={`rounded-xl px-3 py-2.5 ${
                                index === 0
                                  ? "bg-violet-700 text-white"
                                  : "text-zinc-400"
                              }`}
                            >
                              {item}
                            </div>
                          )
                        )}
                      </div>
                    </aside>

                    <div>
                      <div className="rounded-2xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-600 p-5 text-white">
                        <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">
                          Today&apos;s AI plan
                        </p>
                        <h2 className="mt-1 text-base font-bold">
                          Create one useful short video
                        </h2>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {[
                          { label: "Saved Hooks", value: "18", icon: Flame },
                          { label: "Scripts", value: "12", icon: FileText },
                          { label: "Captions", value: "24", icon: MessageSquareText },
                          { label: "Growth Score", value: "82%", icon: BarChart3 },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={item.label}
                              className="rounded-2xl border border-zinc-200 bg-white p-3"
                            >
                              <Icon size={17} className="text-violet-700" />
                              <p className="mt-3 text-xs text-zinc-500">{item.label}</p>
                              <p className="mt-0.5 text-lg font-bold text-zinc-900">
                                {item.value}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side — Login Form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Form Card */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-violet-100 sm:p-10">
                  {/* Header */}
                  <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
                      Welcome back
                    </p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
                      Login to account
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                      Enter your email and password to continue.
                    </p>
                  </div>

                  {/* Message alerts */}
                  {message.text && (
                    <div
                      className={`mb-6 rounded-xl border p-4 text-sm flex items-start gap-3 ${
                        message.type === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          message.type === "success"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {message.type === "success" ? (
                          <Check size={13} />
                        ) : (
                          <span className="font-bold text-xs leading-none">!</span>
                        )}
                      </span>
                      <div>{message.text}</div>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500"
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
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
                        >
                          Password
                        </label>
                        <button
                          type="button"
                          className="text-xs font-semibold text-violet-700 transition hover:text-violet-800"
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
                          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 pr-12 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((previous) => !previous)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <LoaderCircle size={18} className="animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          Login
                          <ArrowRight
                            size={18}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-8 text-center text-sm text-zinc-500">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/register"
                      className="font-semibold text-violet-700 transition hover:text-violet-800 underline decoration-violet-300 hover:decoration-violet-500"
                    >
                      Create account
                    </Link>
                  </p>
                </div>

                {/* Trust badges */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-500">
                  <span className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-600" />
                    Secure login
                  </span>
                  <span className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-600" />
                    Your data is safe
                  </span>
                  <span className="flex items-center gap-2">
                    <Check size={15} className="text-emerald-600" />
                    Free to use
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/ChatGPT image jul 15, 2026, 12_11_21 PM.png"
                alt="Trendora Logo"
                width={240}
                height={70}
                priority
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-400">
              AI-powered content and growth workspace for creators and local
              businesses.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Product</h3>
            <div className="mt-4 space-y-3 text-sm text-zinc-400">
              <Link href="/#features" className="block hover:text-white">
                Features
              </Link>
              <Link href="/#creators" className="block hover:text-white">
                Creator tools
              </Link>
              <Link href="/#business" className="block hover:text-white">
                Business tools
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Account</h3>
            <div className="mt-4 space-y-3 text-sm text-zinc-400">
              <Link href="/register" className="block hover:text-white">
                Create account
              </Link>
              <Link href="/login" className="block hover:text-white">
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Trendora. All rights reserved.
        </div>
      </footer>
    </main>
  );
}