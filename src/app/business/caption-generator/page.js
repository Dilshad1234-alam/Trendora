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
  Crown,
  LoaderCircle,
  Save,
  Sparkles,
} from "lucide-react";

import {
  getCurrentUser,
} from "@/services/auth.api";

import {
  saveContent,
} from "@/services/saved.api";

import {
  generateBusinessCaption,
} from "@/services/business-caption.api";

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

  const [user, setUser] =
    useState(null);

  const [formData, setFormData] =
    useState({
      topic: "",
      platform: "Instagram",
      tone: "Professional",
      cta: "DM Us",
      emoji: true,
    });

  const [caption, setCaption] =
    useState("");

  const [generatedId, setGeneratedId] =
    useState("");

  const [dailyLimit, setDailyLimit] =
    useState(null);

  const [
    remainingFreeCaptions,
    setRemainingFreeCaptions,
  ] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  const [saving, setSaving] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [message, setMessage] =
    useState({
      type: "",
      text: "",
    });

  useEffect(() => {
    async function checkUser() {
      try {
        const response =
          await getCurrentUser();

        const currentUser =
          response?.user ||
          response?.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (
          currentUser.role !== "business"
        ) {
          if (
            currentUser.role === "creator"
          ) {
            router.replace(
              "/creator/dashboard"
            );
          } else {
            router.replace("/");
          }

          return;
        }

        if (
          !currentUser.onboardingCompleted
        ) {
          router.replace(
            "/onboarding/business"
          );
          return;
        }

        const trialExpired =
          !currentUser.planSelected &&
          currentUser.trialExpired;

        if (trialExpired) {
          router.replace(
            "/onboarding/select-plan"
          );
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

  const isFreeAccess =
    !user?.planSelected ||
    user?.plan === "free";

  const dailyLimitReached =
    isFreeAccess &&
    remainingFreeCaptions === 0;

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setSaved(false);
    setMessage({
      type: "",
      text: "",
    });
  };

  const handleGenerate = async (
    event
  ) => {
    event?.preventDefault();

    if (dailyLimitReached) {
      setMessage({
        type: "error",
        text:
          "You have used all 3 free caption generations for today.",
      });

      return;
    }

    if (!formData.topic.trim()) {
      setMessage({
        type: "error",
        text:
          "Please enter a business topic.",
      });

      return;
    }

    try {
      setLoading(true);
      setMessage({
        type: "",
        text: "",
      });
      setSaved(false);
      setCopied(false);

      const response =
        await generateBusinessCaption({
          ...formData,
          topic:
            formData.topic.trim(),
        });

      const result =
        response?.data || {};

      setCaption(
        result.caption || ""
      );

      setGeneratedId(
        result.id || ""
      );

      if (
        result.dailyLimit !== null &&
        result.dailyLimit !== undefined
      ) {
        setDailyLimit(
          result.dailyLimit
        );
      }

      if (
        result.remainingFreeCaptions !==
          null &&
        result.remainingFreeCaptions !==
          undefined
      ) {
        setRemainingFreeCaptions(
          result.remainingFreeCaptions
        );
      }

      setMessage({
        type: "success",
        text:
          "Business caption generated successfully.",
      });
    } catch (error) {
      const limit =
        error?.dailyLimit ??
        error?.data?.dailyLimit;

      const remaining =
        error?.remainingFreeCaptions ??
        error?.data
          ?.remainingFreeCaptions;

      if (
        limit !== null &&
        limit !== undefined
      ) {
        setDailyLimit(limit);
      }

      if (
        remaining !== null &&
        remaining !== undefined
      ) {
        setRemainingFreeCaptions(
          remaining
        );
      }

      setMessage({
        type: "error",
        text:
          error?.message ||
          "Unable to generate caption.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!caption) return;

    try {
      await navigator.clipboard.writeText(
        caption
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setMessage({
        type: "error",
        text:
          "Unable to copy caption.",
      });
    }
  };

  const handleSave = async () => {
    if (!caption) return;

    try {
      setSaving(true);
      setMessage({
        type: "",
        text: "",
      });

      await saveContent({
        type: "business-caption",
        title: `${formData.topic.trim()} ${formData.platform} Caption`,
        content: caption,
        prompt:
          JSON.stringify(formData),
        generatedContentId:
          generatedId || null,
      });

      setSaved(true);

      setMessage({
        type: "success",
        text:
          "Business caption saved successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error?.message ||
          "Unable to save caption.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white">
        <LoaderCircle
          size={26}
          className="animate-spin text-violet-700"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[800px] max-w-full -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-800"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
            Business AI Tool
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            Caption{" "}
            <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">
            Generate customer-focused
            social-media captions using
            your business profile.
          </p>
        </header>

        {isFreeAccess && (
          <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  size={18}
                  className="text-violet-700"
                />

                <p className="font-bold text-violet-800">
                  Free Plan
                </p>
              </div>

              <p className="mt-1 text-sm text-zinc-600">
                You can generate up to
                three business captions
                each day.
              </p>
            </div>

            {dailyLimit !== null &&
              remainingFreeCaptions !==
                null && (
                <div className="rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm">
                  <span className="font-bold text-violet-700">
                    {
                      remainingFreeCaptions
                    }
                  </span>{" "}
                  of {dailyLimit} remaining
                  today
                </div>
              )}
          </section>
        )}

        {message.text && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {dailyLimitReached && (
          <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-amber-800">
                Daily Free Limit Reached
              </p>

              <p className="mt-1 text-sm text-amber-700">
                Your free captions will
                reset tomorrow. Upgrade
                for unlimited
                generations.
              </p>
            </div>

            <Link
              href="/onboarding/select-plan"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              <Crown size={17} />
              Upgrade plan
            </Link>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Business topic
              </label>

              <textarea
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                rows={5}
                maxLength={300}
                placeholder="Example: Promote our website development service for local businesses"
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />

              <p className="mt-2 text-right text-xs text-zinc-400">
                {
                  formData.topic.length
                }
                /300
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Platform"
                name="platform"
                value={
                  formData.platform
                }
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

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <input
                type="checkbox"
                name="emoji"
                checked={
                  formData.emoji
                }
                onChange={handleChange}
                className="h-4 w-4 accent-violet-600"
              />

              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Use emojis
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Add relevant emojis
                  naturally in the
                  caption.
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={
                loading ||
                dailyLimitReached
              }
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Generating...
                </>
              ) : dailyLimitReached ? (
                <>
                  <Crown size={18} />
                  Daily limit reached
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate caption
                </>
              )}
            </button>
          </form>

          <section className="flex min-h-[500px] flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
                  Generated Caption
                </p>

                <h2 className="mt-1 text-xl font-bold text-zinc-900">
                  Your result
                </h2>
              </div>

              {caption && (
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-500">
                  {caption.length}{" "}
                  characters
                </span>
              )}
            </div>

            {loading ? (
              <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-center">
                <LoaderCircle
                  size={30}
                  className="animate-spin text-violet-700"
                />

                <p className="mt-4 text-sm font-medium text-zinc-600">
                  Trendora is writing
                  your caption...
                </p>
              </div>
            ) : caption ? (
              <>
                <div className="mt-5 flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-8 text-zinc-700">
                    {caption}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    {copied ? (
                      <>
                        <Check
                          size={17}
                        />
                        Copied
                      </>
                    ) : (
                      <>
                        <Clipboard
                          size={17}
                        />
                        Copy
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={
                      saving || saved
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {saving ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : saved ? (
                      <Check
                        size={17}
                      />
                    ) : (
                      <Save size={17} />
                    )}

                    {saved
                      ? "Saved"
                      : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleGenerate
                    }
                    disabled={
                      loading ||
                      dailyLimitReached
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles size={17} />
                    Regenerate
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Sparkles size={28} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-zinc-900">
                  Your caption will
                  appear here
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-7 text-zinc-500">
                  Enter a topic, select
                  the platform and tone,
                  then generate your
                  business caption.
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
      <label className="mb-2 block text-sm font-semibold text-zinc-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
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