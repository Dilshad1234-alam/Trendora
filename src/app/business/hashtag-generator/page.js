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
    <main className="min-h-screen bg-[#030014] p-4 text-white sm:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/business/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Business AI Tool
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Hashtag Generator
          </h1>

          <p className="mt-3 text-sm text-zinc-400">
            Generate niche, local and platform-specific
            hashtags for your business.
          </p>
        </header>

        {message && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl border border-white/10 bg-[#0a0520]/70 p-6"
          >
            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Business topic
            </label>

            <textarea
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              rows={5}
              placeholder="Example: Website development services for local shops"
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
            />

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                City
              </label>

              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Example: Patna"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-3 font-semibold disabled:opacity-50"
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

          <section className="flex min-h-[450px] flex-col rounded-3xl border border-white/10 bg-[#0a0520]/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Generated Hashtags
              </h2>

              {hashtags && (
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                  {hashtagTotal} hashtags
                </span>
              )}
            </div>

            {hashtags ? (
              <>
                <div className="mt-5 flex-1 rounded-2xl border border-white/5 bg-[#120f2e]/60 p-5">
                  <p className="whitespace-pre-wrap break-words text-sm leading-8 text-violet-200">
                    {hashtags}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300"
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
                    className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-50"
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
                    className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold disabled:opacity-50"
                  >
                    <Sparkles size={17} />
                    Regenerate
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                  <Hash size={30} />
                </div>

                <h2 className="mt-5 text-xl font-bold">
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
      <label className="mb-2 block text-sm font-semibold text-zinc-300">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-white/10 bg-[#120f2e] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
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