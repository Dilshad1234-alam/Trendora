"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Copy,
  FileText,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { generateBusinessPost } from "@/services/business-ai.api";
import { saveContent } from "@/services/saved.api";

export default function BusinessPostGeneratorPage() {
  const [formData, setFormData] = useState({
    topic: "",
    platform: "instagram",
    postType: "promotional",
    tone: "professional",
    offer: "",
    cta: "",
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

    setSaved(false);
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.topic.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a post topic.",
      });
      return;
    }

    try {
      setLoading(true);
      setResult("");
      setGeneratedId("");
      setSaved(false);
      setMessage({ type: "", text: "" });

      const data = await generateBusinessPost({
        ...formData,
        topic: formData.topic.trim(),
        offer: formData.offer.trim(),
        cta: formData.cta.trim(),
      });

      setResult(data.data.output);
      setGeneratedId(data.data.id);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Unable to generate post.",
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
        text: "Unable to copy post.",
      });
    }
  };

  const handleSave = async () => {
    if (!result) return;

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      await saveContent({
        title: formData.topic.trim() || "Business Post",
        type: "business-post",
        content: result,
        generatedContentId: generatedId || null,
      });

      setSaved(true);

      setMessage({
        type: "success",
        text: "Business post saved successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Unable to save post.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Subtle top gradient */}
      <div className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/business/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 transition-colors"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <FileText size={22} />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
            AI Business Post Generator
          </p>

          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl">
            Create a Business <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Post</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Generate a ready-to-publish local-business post using your
            business profile.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Form Panel */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Post topic
                </label>

                <textarea
                  name="topic"
                  rows={4}
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="Example: Admission open for digital marketing course"
                  className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Platform
                </label>

                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="google-business">
                    Google Business
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Post type
                </label>

                <select
                  name="postType"
                  value={formData.postType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                >
                  <option value="promotional">Promotional</option>
                  <option value="educational">Educational</option>
                  <option value="offer">Offer</option>
                  <option value="service">Service</option>
                  <option value="testimonial">Testimonial</option>
                  <option value="festival">Festival</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Tone
                </label>

                <select
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="educational">Educational</option>
                  <option value="motivational">Motivational</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Offer
                </label>

                <input
                  name="offer"
                  value={formData.offer}
                  onChange={handleChange}
                  placeholder="Example: 20% off until Sunday"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Custom CTA
                </label>

                <input
                  name="cta"
                  value={formData.cta}
                  onChange={handleChange}
                  placeholder="Example: Call us today"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                />
              </div>

              {message.text && (
                <div
                  className={`rounded-xl border p-4 text-sm flex items-start gap-3 transition-all duration-300 ${
                    message.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <div className={`p-1 rounded-md shrink-0 ${
                    message.type === "success" ? "bg-emerald-100" : "bg-red-100"
                  }`}>
                    {message.type === "success" ? (
                      <Sparkles size={16} className="text-emerald-600" />
                    ) : (
                      <span className="text-red-600 font-bold block leading-none w-4 h-4 text-center">!</span>
                    )}
                  </div>
                  <div>{message.text}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-4 font-semibold text-white transition hover:bg-violet-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-200 transition-all duration-300 overflow-hidden"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Generating post...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate post
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Result Panel */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Generated Post
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Your AI-generated post will appear here.
                </p>
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || saved}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Bookmark size={16} />
                    {saving ? "Saving..." : saved ? "Saved" : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors cursor-pointer"
                  >
                    <Copy size={16} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-stretch">
              {loading ? (
                <div className="flex-1 flex min-h-96 flex-col items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-500">
                  <LoaderCircle
                    size={30}
                    className="mb-4 animate-spin text-violet-600"
                  />
                  <p className="font-medium">
                    Trendora is writing your business post...
                  </p>
                </div>
              ) : result ? (
                <div className="flex-1 min-h-96 whitespace-pre-wrap rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm leading-relaxed text-zinc-700 overflow-y-auto">
                  {result}
                </div>
              ) : (
                <div className="flex-1 flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 text-center">
                  <RefreshCw size={28} className="mb-4 text-zinc-400 animate-pulse" />
                  <p className="font-bold text-zinc-700 text-sm">
                    No post generated yet
                  </p>
                  <p className="mt-2 text-xs text-zinc-500 text-center max-w-xs leading-relaxed">
                    Enter your post details on the left and generate your business post.
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