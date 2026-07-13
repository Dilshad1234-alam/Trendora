"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import { completeCreatorOnboarding } from "@/services/onboarding.api";

export default function CreatorOnboardingPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    niche: "",
    language: "",
    platform: "",
    tone: "",
    audienceSize: "",
    goal: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const {
      niche,
      language,
      platform,
      tone,
      audienceSize,
      goal,
    } = formData;

    if (
      !niche ||
      !language ||
      !platform ||
      !tone ||
      !audienceSize ||
      !goal
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const data = await completeCreatorOnboarding(formData);

      router.replace(data.nextRoute || "/creator/dashboard");
    } catch (error) {
      setMessage(error.message || "Creator onboarding failed.");
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
      <div className="relative w-full max-w-3xl p-6 sm:p-12 md:p-16 rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl shadow-2xl shadow-violet-950/20">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Sparkles size={26} className="animate-pulse" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Creator Onboarding
          </p>

          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Tell us about your <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">content</span>
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Trendora will use this information to personalize trends,
            scripts and growth suggestions for you.
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mb-6 rounded-xl border p-4 text-sm flex items-start gap-3 backdrop-blur-md transition-all duration-300 border-red-500/25 bg-red-500/10 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <div className="p-1 rounded-md shrink-0 bg-red-500/20">
              <span className="text-red-400 font-bold block leading-none w-4 h-4 text-center">!</span>
            </div>
            <div>{message}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="niche"
              className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
            >
              Niche
            </label>

            <select
              id="niche"
              name="niche"
              value={formData.niche}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 [&>option]:bg-[#0c0827] [&>option]:text-white"
            >
              <option value="">Select niche</option>
              <option value="technology">Technology</option>
              <option value="education">Education</option>
              <option value="motivation">Motivation</option>
              <option value="fashion">Fashion</option>
              <option value="islamic-content">Islamic Content</option>
              <option value="finance">Finance</option>
              <option value="fitness">Fitness</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="language"
              className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
            >
              Language
            </label>

            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 [&>option]:bg-[#0c0827] [&>option]:text-white"
            >
              <option value="">Select language</option>
              <option value="hindi">Hindi</option>
              <option value="english">English</option>
              <option value="hinglish">Hinglish</option>
              <option value="urdu">Urdu</option>
              <option value="bhojpuri">Bhojpuri</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="platform"
              className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
            >
              Platform
            </label>

            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 [&>option]:bg-[#0c0827] [&>option]:text-white"
            >
              <option value="">Select platform</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="tone"
              className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
            >
              Tone
            </label>

            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 [&>option]:bg-[#0c0827] [&>option]:text-white"
            >
              <option value="">Select tone</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="educational">Educational</option>
              <option value="emotional">Emotional</option>
              <option value="funny">Funny</option>
              <option value="motivational">Motivational</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="audienceSize"
              className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
            >
              Audience size
            </label>

            <select
              id="audienceSize"
              name="audienceSize"
              value={formData.audienceSize}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 [&>option]:bg-[#0c0827] [&>option]:text-white"
            >
              <option value="">Select audience size</option>
              <option value="0-1k">0–1K</option>
              <option value="1k-10k">1K–10K</option>
              <option value="10k-50k">10K–50K</option>
              <option value="50k-plus">50K+</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="goal"
              className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
            >
              Primary goal
            </label>

            <select
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 [&>option]:bg-[#0c0827] [&>option]:text-white"
            >
              <option value="">Select goal</option>
              <option value="followers">Grow followers</option>
              <option value="views">Increase views</option>
              <option value="personal-brand">Build personal brand</option>
              <option value="leads">Generate leads</option>
              <option value="earning">Earn money</option>
              <option value="community">Build community</option>
            </select>
          </div>

          <div className="sm:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-4 font-semibold text-white transition hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] transition-all duration-300 overflow-hidden"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving profile...
                </>
              ) : (
                <>
                  Complete onboarding
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}