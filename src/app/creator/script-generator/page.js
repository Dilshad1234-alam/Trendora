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
    <main className="min-h-screen bg-[#030014] text-white p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[35%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Background Dots Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <Link
          href="/creator/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <FileText size={22} className="animate-pulse" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            AI Script Generator
          </p>

          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-white">
            Create a Ready-to-Record <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">Script</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Enter a topic and Trendora will create a hook, scenes, voiceover,
            CTA, caption and hashtags.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Panel */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-6 shadow-2xl shadow-violet-950/20 sm:p-8"
          >
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Topic
              </label>

              <textarea
                name="topic"
                rows={4}
                value={formData.topic}
                onChange={handleChange}
                placeholder="Example: AI tools se resume kaise banaye"
                className="w-full resize-none rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Selected hook
              </label>

              <textarea
                name="hook"
                rows={3}
                value={formData.hook}
                onChange={handleChange}
                placeholder="Optional: Paste your best hook"
                className="w-full resize-none rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Duration
              </label>

              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 [&>option]:bg-[#0c0827] [&>option]:text-white"
              >
                <option value="15 seconds">15 seconds</option>
                <option value="30 seconds">30 seconds</option>
                <option value="45 seconds">45 seconds</option>
                <option value="60 seconds">60 seconds</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Tone
              </label>

              <select
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 [&>option]:bg-[#0c0827] [&>option]:text-white"
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
              <div className="rounded-xl border p-4 text-sm flex items-start gap-3 backdrop-blur-md transition-all duration-300 border-red-500/25 bg-red-500/10 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <div className="p-1 rounded-md shrink-0 bg-red-500/20">
                  <span className="text-red-400 font-bold block leading-none w-4 h-4 text-center">!</span>
                </div>
                <div>{message}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-4 font-semibold text-white transition hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] transition-all duration-300 overflow-hidden"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Generating script...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate script
                </>
              )}
            </button>
          </form>

          {/* Results Panel */}
          <section className="rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-6 shadow-2xl shadow-violet-950/20 sm:p-8 flex flex-col">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Generated Script
                </h2>

                <p className="mt-1 text-xs text-zinc-400">
                  Your AI-generated script will appear here.
                </p>
              </div>

              {result && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300 hover:bg-violet-500/20 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy size={16} />
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-stretch">
              {loading ? (
                <div className="flex-1 flex min-h-[24rem] flex-col items-center justify-center rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-400">
                  <LoaderCircle
                    size={30}
                    className="mb-4 animate-spin text-violet-400"
                  />
                  <p className="text-sm">Trendora is writing your script...</p>
                </div>
              ) : result ? (
                <div className="flex-1 min-h-[24rem] whitespace-pre-wrap rounded-2xl border border-white/5 bg-[#120f2e]/35 p-5 text-sm leading-relaxed text-zinc-300 overflow-y-auto">
                  {result}
                </div>
              ) : (
                <div className="flex-1 flex min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] px-6 text-center">
                  <Sparkles size={28} className="mb-4 text-zinc-600 animate-pulse" />
                  <p className="font-bold text-zinc-300 text-sm">
                    No script generated yet
                  </p>
                  <p className="mt-2 text-xs text-zinc-500 text-center max-w-xs leading-relaxed">
                    Enter your topic on the left and click Generate Script.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}