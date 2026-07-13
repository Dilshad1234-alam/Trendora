"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Flame,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { generateHooks } from "@/services/ai.api";

export default function HookGeneratorPage() {
  const [formData, setFormData] = useState({
    topic: "",
    tone: "",
    goal: "",
  });

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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

    if (!formData.topic.trim()) {
      setMessage("Please enter a topic.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setResult("");

      const data = await generateHooks({
        topic: formData.topic.trim(),
        tone: formData.tone,
        goal: formData.goal,
      });

      setResult(data.data.output);
    } catch (error) {
      setMessage(error.message || "Unable to generate hooks.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setMessage("Unable to copy hooks.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7fb] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/creator/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-700 text-white">
            <Flame size={24} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
            AI Hook Generator
          </p>

          <h1 className="mt-2 text-3xl font-bold text-zinc-900 sm:text-4xl">
            Create scroll-stopping hooks
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Enter your topic and Trendora will generate personalized hooks
            using your niche, language, platform and creator goal.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-zinc-900">
              Hook details
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="topic"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Content topic
                </label>

                <textarea
                  id="topic"
                  name="topic"
                  rows={5}
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="Example: AI tools se professional resume kaise banaye"
                  className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
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
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Use profile tone</option>
                  <option value="professional">Professional</option>
                  <option value="educational">Educational</option>
                  <option value="emotional">Emotional</option>
                  <option value="friendly">Friendly</option>
                  <option value="funny">Funny</option>
                  <option value="motivational">Motivational</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="goal"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Goal
                </label>

                <select
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Use profile goal</option>
                  <option value="followers">Grow followers</option>
                  <option value="views">Increase views</option>
                  <option value="personal-brand">
                    Build personal brand
                  </option>
                  <option value="leads">Generate leads</option>
                  <option value="community">Build community</option>
                </select>
              </div>

              {message && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3.5 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Generating hooks...
                  </>
                ) : (
                  <>
                    <Sparkles size={19} />
                    Generate hooks
                  </>
                )}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Generated hooks
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Your AI-generated result will appear here.
                </p>
              </div>

              {result && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700"
                >
                  <Copy size={16} />
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl bg-zinc-50 text-zinc-500">
                <LoaderCircle
                  size={30}
                  className="mb-4 animate-spin text-violet-700"
                />

                <p className="font-medium">Trendora is writing hooks...</p>
              </div>
            ) : result ? (
              <div className="min-h-80 whitespace-pre-wrap rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-sm leading-7 text-zinc-700">
                {result}
              </div>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 text-center">
                <RefreshCw size={28} className="mb-4 text-zinc-300" />

                <p className="font-medium text-zinc-600">
                  No hooks generated yet
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Enter your topic and click Generate Hooks.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}