"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlignLeft,
  ArrowLeft,
  Bookmark,
  Copy,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { generateVideoDescription } from "@/services/ai.api";
import { saveContent } from "@/services/saved.api";

export default function VideoDescriptionGeneratorPage() {
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    keywords: "",
    platform: "",
    tone: "",
    descriptionLength: "medium",
  });

  const [result, setResult] = useState("");
  const [generatedId, setGeneratedId] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage({
      type: "",
      text: "",
    });

    setSaved(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a video title.",
      });

      return;
    }

    try {
      setLoading(true);
      setResult("");
      setGeneratedId("");
      setSaved(false);

      setMessage({
        type: "",
        text: "",
      });

      const data = await generateVideoDescription({
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        keywords: formData.keywords.trim(),
        platform: formData.platform,
        tone: formData.tone,
        descriptionLength: formData.descriptionLength,
      });

      setResult(data.data.output);
      setGeneratedId(data.data.id);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to generate video description.",
      });
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
      setMessage({
        type: "error",
        text: "Unable to copy video description.",
      });
    }
  };

  const handleSave = async () => {
    if (!result) return;

    try {
      setSaving(true);

      setMessage({
        type: "",
        text: "",
      });

      await saveContent({
        title:
          formData.title.trim() ||
          "Generated Video Description",
        type: "video-description",
        content: result,
        generatedContentId: generatedId || null,
      });

      setSaved(true);

      setMessage({
        type: "success",
        text: "Video description saved successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to save video description.",
      });
    } finally {
      setSaving(false);
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
            <AlignLeft size={22} className="animate-pulse" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            AI Video Description Generator
          </p>

          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Create SEO-Friendly Video <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">Descriptions</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Generate a detailed description, short summary, keywords,
            CTA and hashtags for your video.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Form Panel */}
          <section className="rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-6 shadow-2xl shadow-violet-950/20 sm:p-8">
            <h2 className="text-xl font-bold text-white">
              Video Details
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
                >
                  Video title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: How to create a resume using AI"
                  className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                />
              </div>

              <div>
                <label
                  htmlFor="summary"
                  className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
                >
                  Video summary
                </label>

                <textarea
                  id="summary"
                  name="summary"
                  rows={5}
                  value={formData.summary}
                  onChange={handleChange}
                  placeholder="Briefly explain what the video contains..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                />
              </div>

              <div>
                <label
                  htmlFor="keywords"
                  className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
                >
                  Keywords
                </label>

                <input
                  id="keywords"
                  name="keywords"
                  type="text"
                  value={formData.keywords}
                  onChange={handleChange}
                  placeholder="AI resume, ChatGPT, ATS resume"
                  className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                />

                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  Optional: Separate multiple keywords with commas.
                </p>
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
                  <option value="">
                    Use profile platform
                  </option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
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
                  <option value="">
                    Use profile tone
                  </option>
                  <option value="professional">
                    Professional
                  </option>
                  <option value="educational">
                    Educational
                  </option>
                  <option value="friendly">Friendly</option>
                  <option value="emotional">Emotional</option>
                  <option value="motivational">
                    Motivational
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="descriptionLength"
                  className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
                >
                  Description length
                </label>

                <select
                  id="descriptionLength"
                  name="descriptionLength"
                  value={formData.descriptionLength}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 [&>option]:bg-[#0c0827] [&>option]:text-white"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-4 font-semibold text-white transition hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] transition-all duration-300 overflow-hidden"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Generating description...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate description
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Result Panel */}
          <section className="rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-6 shadow-2xl shadow-violet-950/20 sm:p-8 flex flex-col">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Generated Description
                </h2>

                <p className="mt-1 text-xs text-zinc-400">
                  Your AI-generated video description will appear here.
                </p>
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || saved}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Bookmark size={16} />
                    {saving
                      ? "Saving..."
                      : saved
                        ? "Saved"
                        : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300 hover:bg-violet-500/20 hover:text-white transition-colors cursor-pointer"
                  >
                    <Copy size={16} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-stretch">
              {loading ? (
                <div className="flex-1 flex min-h-96 flex-col items-center justify-center rounded-2xl bg-white/[0.02] border border-white/5 text-zinc-400">
                  <LoaderCircle
                    size={30}
                    className="mb-4 animate-spin text-violet-400"
                  />
                  <p className="font-medium">
                    Trendora is writing your description...
                  </p>
                </div>
              ) : result ? (
                <div className="flex-1 min-h-96 whitespace-pre-wrap rounded-2xl border border-white/5 bg-[#120f2e]/35 p-5 text-sm leading-relaxed text-zinc-300 overflow-y-auto">
                  {result}
                </div>
              ) : (
                <div className="flex-1 flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] px-6 text-center">
                  <RefreshCw
                    size={28}
                    className="mb-4 text-zinc-600 animate-pulse"
                  />
                  <p className="font-bold text-zinc-300 text-sm">
                    No description generated yet
                  </p>
                  <p className="mt-2 text-xs text-zinc-500 text-center max-w-xs leading-relaxed">
                    Enter your video details on the left and generate a description.
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