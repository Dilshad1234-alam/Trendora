"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Check,
  Clipboard,
  Hash,
  LoaderCircle,
  Save,
  Sparkles,
} from "lucide-react";

import { generateBusinessHashtags } from "@/services/business-hashtag.api";
import { saveContent } from "@/services/saved.api";

const platforms = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "YouTube",
];

const counts = [10, 15, 20, 30];

export default function BusinessHashtagGeneratorPage() {
  const [formData, setFormData] = useState({
    topic: "",
    city: "",
    platform: "Instagram",
    count: 20,
  });

  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: name === "count" ? Number(value) : value,
    }));
  }

  async function handleGenerate(event) {
    event?.preventDefault();

    if (!formData.topic.trim()) {
      setMessage("Please enter a business topic.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setSaved(false);
      setCopied(false);

      const response = await generateBusinessHashtags({
        ...formData,
        topic: formData.topic.trim(),
      });

      setHashtags(response.data?.hashtags || "");
    } catch (error) {
      setMessage(
        error.message || "Unable to generate hashtags."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!hashtags) return;

    try {
      await navigator.clipboard.writeText(hashtags);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setMessage("Unable to copy hashtags.");
    }
  }

  async function handleSave() {
    if (!hashtags) return;

    try {
      setSaving(true);
      setMessage("");

      await saveContent({
        type: "business-hashtag",
        title: `${formData.topic} ${formData.platform} Hashtags`,
        content: hashtags,
        prompt: JSON.stringify(formData),
      });

      setSaved(true);
    } catch (error) {
      setMessage(
        error.message || "Unable to save hashtags."
      );
    } finally {
      setSaving(false);
    }
  }

  const hashtagTotal = hashtags
    .split(/\s+/)
    .filter((tag) => tag.startsWith("#")).length;

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      <div className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/business/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 transition-colors"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <header className="mt-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
            Business AI Tool
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            Hashtag Generator
          </h1>

          <p className="mt-3 text-sm text-zinc-600">
            Generate niche, local and platform-specific
            hashtags for your business.
          </p>
        </header>

        {message && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <label className="mb-2 block text-sm font-semibold text-zinc-700">
              Business topic
            </label>

            <textarea
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              rows={5}
              placeholder="Example: Website development services for local shops"
              className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                City
              </label>

              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Example: Patna"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Platform"
                name="platform"
                value={formData.platform}
                options={platforms}
                onChange={handleChange}
              />

              <SelectField
                label="Number of hashtags"
                name="count"
                value={formData.count}
                options={counts}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-800 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate hashtags
                </>
              )}
            </button>
          </form>

          <section className="flex min-h-[450px] flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">
                Generated Hashtags
              </h2>

              {hashtags && (
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-500">
                  {hashtagTotal} hashtags
                </span>
              )}
            </div>

            {hashtags ? (
              <>
                <div className="mt-5 flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                  <p className="whitespace-pre-wrap break-words text-sm leading-8 text-violet-700 font-medium">
                    {hashtags}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={17} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Clipboard size={17} />
                        Copy
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || saved}
                    className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 disabled:opacity-50 hover:bg-emerald-100 transition-colors"
                  >
                    {saving ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : saved ? (
                      <Check size={17} />
                    ) : (
                      <Save size={17} />
                    )}

                    {saved ? "Saved" : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-violet-800 transition-colors"
                  >
                    <Sparkles size={17} />
                    Regenerate
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Hash size={30} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-zinc-900">
                  Hashtags will appear here
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-7 text-zinc-500">
                  Enter your topic and generate optimized
                  business hashtags.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}