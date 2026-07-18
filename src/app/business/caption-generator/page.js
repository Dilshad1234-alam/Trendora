"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  Clipboard,
  LoaderCircle,
  Save,
  Sparkles,
} from "lucide-react";

import { getCurrentUser } from "@/services/auth.api";
import { saveContent } from "@/services/saved.api";
import { generateBusinessCaption } from "@/services/business-caption.api";

const platforms = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "Google Business",
];

const tones = [
  "Professional",
  "Friendly",
  "Promotional",
  "Luxury",
  "Casual",
  "Emotional",
];

const ctaOptions = [
  "DM Us",
  "Call Now",
  "Book Today",
  "Visit Store",
  "Contact Us",
  "Learn More",
];

export default function BusinessCaptionGeneratorPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    topic: "",
    platform: "Instagram",
    tone: "Professional",
    cta: "DM Us",
    emoji: true,
  });

  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await getCurrentUser();

        const currentUser =
          response.user || response.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (currentUser.role !== "business") {
          if (currentUser.role === "creator") {
            router.replace("/creator/dashboard");
          } else {
            router.replace("/");
          }

          return;
        }

        if (!currentUser.onboardingCompleted) {
          router.replace("/onboarding/business");
          return;
        }

        if (
          !currentUser.planSelected ||
          !currentUser.plan
        ) {
          router.replace("/onboarding/select-plan");
          return;
        }
      } catch {
        router.replace("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const handleGenerate = async (event) => {
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

      const response =
        await generateBusinessCaption({
          ...formData,
          topic: formData.topic.trim(),
        });

      setCaption(response.data?.caption || "");
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to generate caption."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!caption) return;

    try {
      await navigator.clipboard.writeText(caption);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setMessage("Unable to copy caption.");
    }
  };

  const handleSave = async () => {
    if (!caption) return;

    try {
      setSaving(true);
      setMessage("");

      await saveContent({
        type: "business-caption",
        title: `${formData.topic} ${formData.platform} Caption`,
        content: caption,
        prompt: JSON.stringify(formData),
      });

      setSaved(true);
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to save caption."
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030014] text-white">
        <LoaderCircle
          size={25}
          className="animate-spin text-violet-400"
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030014] p-4 text-white sm:p-6 md:p-8">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[55%] w-[55%] rounded-full bg-violet-600/10 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[55%] w-[55%] rounded-full bg-cyan-600/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="mb-8">
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Business AI Tool
          </p>

          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
            Caption Generator
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Generate customer-focused captions for
            your business social-media posts.
          </p>
        </header>

        {message && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl border border-white/10 bg-[#0a0520]/60 p-6 backdrop-blur-xl"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Business topic
              </label>

              <textarea
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                rows={5}
                placeholder="Example: Promote our website development service for local businesses"
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Platform"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                options={platforms}
              />

              <SelectField
                label="Tone"
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                options={tones}
              />
            </div>

            <div className="mt-5">
              <SelectField
                label="Call to action"
                name="cta"
                value={formData.cta}
                onChange={handleChange}
                options={ctaOptions}
              />
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <input
                type="checkbox"
                name="emoji"
                checked={formData.emoji}
                onChange={handleChange}
                className="h-4 w-4 accent-violet-600"
              />

              <div>
                <p className="text-sm font-semibold text-white">
                  Use emojis
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Add relevant emojis naturally in
                  the caption.
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
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
                  Generate caption
                </>
              )}
            </button>
          </form>

          <section className="flex min-h-[500px] flex-col rounded-3xl border border-white/10 bg-[#0a0520]/60 p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                  Generated Caption
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Your result
                </h2>
              </div>

              {caption && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                  {caption.length} characters
                </span>
              )}
            </div>

            {caption ? (
              <>
                <div className="mt-5 flex-1 rounded-2xl border border-white/5 bg-[#120f2e]/45 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-8 text-zinc-300">
                    {caption}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300"
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-50"
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <Sparkles size={17} />
                    Regenerate
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                  <Sparkles size={28} />
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  Your caption will appear here
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-7 text-zinc-500">
                  Enter a topic, select your platform
                  and tone, then generate a business
                  caption.
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
  onChange,
  options,
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
        className="w-full rounded-xl border border-white/10 bg-[#120f2e] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}