"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Copy,
  Crown,
  ImageIcon,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { getCurrentUser } from "@/services/auth.api";
import { generateThumbnailTitles } from "@/services/ai-pro.api";
import { saveContent } from "@/services/saved.api";

export default function ProThumbnailTitleGeneratorPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [formData, setFormData] = useState({
    topic: "",
    platform: "",
    tone: "",
    titleStyle: "mixed",
    titleCount: "10",
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

  useEffect(() => {
    async function checkUser() {
      try {
        const response = await getCurrentUser();

        const currentUser = response?.user || response?.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (currentUser.plan !== "creator-pro") {
          router.replace("/creator/dashboard");
          return;
        }

        if (!currentUser.onboardingCompleted) {
          router.replace("/onboarding/creator");
          return;
        }

        setUser(currentUser);
      } catch {
        router.replace("/login");
      } finally {
        setAuthLoading(false);
      }
    }

    checkUser();
  }, [router]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.topic.trim()) {
      setMessage({ type: "error", text: "Please enter a video topic." });
      return;
    }

    try {
      setLoading(true);
      setResult("");
      setGeneratedId("");
      setSaved(false);
      setMessage({ type: "", text: "" });

      const data = await generateThumbnailTitles({
        topic: formData.topic.trim(),
        platform: formData.platform,
        tone: formData.tone,
        titleStyle: formData.titleStyle,
        titleCount: Number(formData.titleCount),
      });

      const resultData = data?.data || {};

      setResult(resultData.output || "");
      setGeneratedId(resultData.id || "");

      setMessage({ type: "success", text: "Pro Thumbnail titles generated successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Unable to generate thumbnail titles." });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setMessage({ type: "error", text: "Unable to copy thumbnail titles." });
    }
  };

  const handleSave = async () => {
    if (!result) {
      setMessage({ type: "error", text: "Generate titles first." });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      await saveContent({
        title: formData.topic.trim() || "Thumbnail Titles",
        type: "thumbnail-title",
        content: result,
        generatedContentId: generatedId || null,
      });

      setSaved(true);
      setMessage({ type: "success", text: "Thumbnail titles saved successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Unable to save thumbnail titles." });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 via-white to-white text-zinc-900">
        <LoaderCircle size={30} className="animate-spin text-amber-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      <div className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/creator-pro/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <ImageIcon size={22} />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
            Pro AI Thumbnail Title Generator
          </p>

          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl">
            Create Clickable Thumbnail <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">Titles</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Generate short and attention-grabbing titles for videos, reels and social-media thumbnails.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Form Panel */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Video topic
                </label>
                <textarea
                  rows={4}
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="Example: How to create a resume using AI"
                  className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                >
                  <option value="">Use profile platform</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
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
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                >
                  <option value="">Use profile tone</option>
                  <option value="professional">Professional</option>
                  <option value="educational">Educational</option>
                  <option value="emotional">Emotional</option>
                  <option value="friendly">Friendly</option>
                  <option value="motivational">Motivational</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Title style
                </label>
                <select
                  name="titleStyle"
                  value={formData.titleStyle}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                >
                  <option value="mixed">Mixed styles</option>
                  <option value="curiosity">Curiosity</option>
                  <option value="authority">Authority</option>
                  <option value="emotional">Emotional</option>
                  <option value="contrarian">Contrarian</option>
                  <option value="educational">Educational</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Number of titles
                </label>
                <select
                  name="titleCount"
                  value={formData.titleCount}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                >
                  <option value="5">5 titles</option>
                  <option value="10">10 titles</option>
                  <option value="15">15 titles</option>
                  <option value="20">20 titles</option>
                </select>
              </div>

              {message.text && (
                <div
                  className={`rounded-xl border p-4 text-sm flex items-start gap-3 transition-all duration-300 ${
                    message.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <div
                    className={`p-1 rounded-md shrink-0 ${
                      message.type === "success" ? "bg-emerald-100" : "bg-red-100"
                    }`}
                  >
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
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-4 font-semibold text-white transition hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-200 transition-all duration-300 overflow-hidden"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Generating titles...
                  </>
                ) : (
                  <>
                    <Crown size={18} />
                    Generate Pro Titles
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Result Panel */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Generated Titles</h2>
                <p className="mt-1 text-xs text-zinc-500">Your AI-generated output will appear here.</p>
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
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
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
                  <LoaderCircle size={30} className="mb-4 animate-spin text-amber-600" />
                  <p className="font-medium">Trendora is writing titles...</p>
                </div>
              ) : result ? (
                <div className="flex-1 min-h-96 whitespace-pre-wrap rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm leading-relaxed text-zinc-700 overflow-y-auto">
                  {result}
                </div>
              ) : (
                <div className="flex-1 flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 text-center">
                  <RefreshCw size={28} className="mb-4 text-zinc-400 animate-pulse" />
                  <p className="font-bold text-zinc-700 text-sm">No titles generated yet</p>
                  <p className="mt-2 text-xs text-zinc-500 text-center max-w-xs leading-relaxed">
                    Enter a video topic on the left and generate titles.
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
