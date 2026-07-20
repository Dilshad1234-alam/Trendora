"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LoaderCircle, Sparkles, Check } from "lucide-react";
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

    const { niche, language, platform, tone, audienceSize, goal } = formData;

    if (!niche || !language || !platform || !tone || !audienceSize || !goal) {
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

  const selectClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 appearance-none cursor-pointer";

  const labelClass =
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500";

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

          <div className="flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5">
            <Sparkles size={14} className="text-violet-700" />
            <span className="text-xs font-semibold text-violet-700">
              Creator Onboarding
            </span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
        <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/25 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Sparkles size={26} />
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Creator Onboarding
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
              Tell us about your{" "}
              <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                content
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Trendora will use this information to personalize trends,
              scripts and growth suggestions for you.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-violet-100 sm:p-10">
            {/* Message Alert */}
            {message && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm flex items-start gap-3 text-red-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                  <span className="font-bold text-xs leading-none">!</span>
                </span>
                <div>{message}</div>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="niche" className={labelClass}>
                  Niche
                </label>
                <select
                  id="niche"
                  name="niche"
                  value={formData.niche}
                  onChange={handleChange}
                  className={selectClass}
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
                <label htmlFor="language" className={labelClass}>
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className={selectClass}
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
                <label htmlFor="platform" className={labelClass}>
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="">Select platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              <div>
                <label htmlFor="tone" className={labelClass}>
                  Tone
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className={selectClass}
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
                <label htmlFor="audienceSize" className={labelClass}>
                  Audience size
                </label>
                <select
                  id="audienceSize"
                  name="audienceSize"
                  value={formData.audienceSize}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="">Select audience size</option>
                  <option value="0-1k">0–1K</option>
                  <option value="1k-10k">1K–10K</option>
                  <option value="10k-50k">10K–50K</option>
                  <option value="50k-plus">50K+</option>
                </select>
              </div>

              <div>
                <label htmlFor="goal" className={labelClass}>
                  Primary goal
                </label>
                <select
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className={selectClass}
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

              <div className="sm:col-span-2 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Saving profile...
                    </>
                  ) : (
                    <>
                      Complete onboarding
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <Check size={15} className="text-emerald-600" />
              Personalized AI results
            </span>
            <span className="flex items-center gap-2">
              <Check size={15} className="text-emerald-600" />
              Updated anytime from settings
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}