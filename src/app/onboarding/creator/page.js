"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Sparkles } from "lucide-react";
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

      const data = await completeCreatorOnboarding(formData)

    //   console.log("Creator onboarding data:", formData);

      router.replace(data.nextRoute || "/creator/dashboard");
    } catch (error) {
      setMessage(error.message || "Creator onboarding failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7fb] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-700 text-white">
            <Sparkles size={26} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            Creator Onboarding
          </p>

          <h1 className="mt-2 text-3xl font-bold text-zinc-900">
            Tell us about your content
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Trendora will use this information to personalize trends,
            scripts and growth suggestions for you.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="niche"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Niche
            </label>

            <select
              id="niche"
              name="niche"
              value={formData.niche}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Language
            </label>

            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Platform
            </label>

            <select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Tone
            </label>

            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Audience size
            </label>

            <select
              id="audienceSize"
              name="audienceSize"
              value={formData.audienceSize}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              Primary goal
            </label>

            <select
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3.5 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Saving profile...
                </>
              ) : (
                "Complete onboarding"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}