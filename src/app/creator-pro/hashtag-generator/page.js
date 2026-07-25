"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Copy,
  Crown,
  Hash,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { getCurrentUser } from "@/services/auth.api";
import { generateHashtags } from "@/services/ai-pro.api";
import { saveContent } from "@/services/saved.api";

export default function ProHashtagGeneratorPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [formData, setFormData] = useState({
    topic: "",
    platform: "",
    language: "",
    hashtagCount: "20",
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
      setMessage({ type: "error", text: "Please enter a topic." });
      return;
    }

    try {
      setLoading(true);
      setResult("");
      setGeneratedId("");
      setSaved(false);
      setMessage({ type: "", text: "" });

      const data = await generateHashtags({
        topic: formData.topic.trim(),
        platform: formData.platform,
        language: formData.language,
        hashtagCount: Number(formData.hashtagCount),
      });

      const resultData = data?.data || {};

      setResult(resultData.output || "");
      setGeneratedId(resultData.id || "");

      setMessage({ type: "success", text: "Pro Hashtags generated successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Unable to generate hashtags." });
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
      setMessage({ type: "error", text: "Unable to copy hashtags." });
    }
  };

  const handleSave = async () => {
    if (!result) {
      setMessage({ type: "error", text: "Generate hashtags first." });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      await saveContent({
        title: formData.topic.trim() || "Generated Hashtags",
        type: "hashtag",
        content: result,
        generatedContentId: generatedId || null,
      });

      setSaved(true);
      setMessage({ type: "success", text: "Hashtags saved successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Unable to save hashtags." });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white text-zinc-900">
        <LoaderCircle size={30} className="animate-spin text-violet-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      <div className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/creator-pro/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Hash size={22} />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
            Pro AI Hashtag Generator
          </p>

          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl">
            Generate Relevant <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-red-600 bg-clip-text text-transparent">Hashtags</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Generate broad, niche and low-competition hashtags based on your creator profile.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Form Panel */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Content topic
                </label>
                <textarea
                  rows={4}
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="Example: AI tools for students"
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
                  <option value="">Use profile platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                >
                  <option value="">Use profile language</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="hinglish">Hinglish</option>
                  <option value="urdu">Urdu</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Number of hashtags
                </label>
                <select
                  name="hashtagCount"
                  value={formData.hashtagCount}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                >
                  <option value="10">10 hashtags</option>
                  <option value="15">15 hashtags</option>
                  <option value="20">20 hashtags</option>
                  <option value="25">25 hashtags</option>
                  <option value="30">30 hashtags</option>
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
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 font-semibold text-white transition hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-200 transition-all duration-300 overflow-hidden"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={18} />
                    Generating hashtags...
                  </>
                ) : (
                  <>
                    <Crown size={18} />
                    Generate Pro Hashtags
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Result Panel */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Generated Hashtags</h2>
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
                  <LoaderCircle size={30} className="mb-4 animate-spin text-violet-600" />
                  <p className="font-medium">Trendora is finding hashtags...</p>
                </div>
              ) : result ? (
                <div className="flex-1 min-h-96 whitespace-pre-wrap rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm leading-relaxed text-zinc-700 overflow-y-auto">
                  {result}
                </div>
              ) : (
                <div className="flex-1 flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 text-center">
                  <RefreshCw size={28} className="mb-4 text-zinc-400 animate-pulse" />
                  <p className="font-bold text-zinc-700 text-sm">No hashtags generated yet</p>
                  <p className="mt-2 text-xs text-zinc-500 text-center max-w-xs leading-relaxed">
                    Enter your topic on the left and generate hashtags.
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
