"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  FileText,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { generateScript } from "@/services/ai.api";

export default function ScriptGeneratorPage() {
  const [formData, setFormData] = useState({
    topic: "",
    hook: "",
    duration: "30 seconds",
    tone: "",
  });

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
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

      const data = await generateScript({
        ...formData,
        topic: formData.topic.trim(),
        hook: formData.hook.trim(),
      });

      setResult(data.data.output);
    } catch (error) {
      setMessage(error.message || "Unable to generate script.");
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
      setMessage("Unable to copy script.");
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
            <FileText size={24} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
            AI Script Generator
          </p>

          <h1 className="mt-2 text-3xl font-bold text-zinc-900">
            Create a ready-to-record script
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Enter a topic and Trendora will create a hook, scenes, voiceover,
            CTA, caption and hashtags.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Topic
              </label>

              <textarea
                name="topic"
                rows={4}
                value={formData.topic}
                onChange={handleChange}
                placeholder="Example: AI tools se resume kaise banaye"
                className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Selected hook
              </label>

              <textarea
                name="hook"
                rows={3}
                value={formData.hook}
                onChange={handleChange}
                placeholder="Optional: Paste your best hook"
                className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Duration
              </label>

              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              >
                <option value="15 seconds">15 seconds</option>
                <option value="30 seconds">30 seconds</option>
                <option value="45 seconds">45 seconds</option>
                <option value="60 seconds">60 seconds</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Tone
              </label>

              <select
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
                  Generating script...
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  Generate script
                </>
              )}
            </button>
          </form>

          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Generated script
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Your AI-generated script will appear here.
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

            <div className="min-h-96 whitespace-pre-wrap rounded-2xl border border-zinc-100 bg-zinc-50 p-5 text-sm leading-7 text-zinc-700">
              {loading
                ? "Trendora is writing your script..."
                : result || "Your script will appear here."}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}