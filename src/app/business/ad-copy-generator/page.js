"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  Clipboard,
  FileText,
  LoaderCircle,
  Megaphone,
  RefreshCw,
  Save,
  Sparkles,
  Target,
} from "lucide-react";

import { getCurrentUser } from "@/services/auth.api";
import { saveContent } from "@/services/saved.api";
import { generateBusinessAdCopy } from "@/services/business-ad-copy.api";

const campaignGoals = [
  "Lead Generation",
  "Sales",
  "Brand Awareness",
  "Website Traffic",
  "Store Visits",
  "App Promotion",
];

const platforms = [
  "Facebook",
  "Instagram",
  "Google",
  "LinkedIn",
];

const tones = [
  "Professional",
  "Friendly",
  "Promotional",
  "Luxury",
  "Urgent",
  "Casual",
  "Trustworthy",
];

const ctaOptions = [
  "Contact Us",
  "Book Now",
  "Learn More",
  "Call Now",
  "Shop Now",
  "Get Started",
  "Send Message",
  "Visit Store",
];

const initialAdCopy = {
  headline: "",
  primaryText: "",
  description: "",
  cta: "",
};

export default function BusinessAdCopyGeneratorPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    goal: "Lead Generation",
    product: "",
    audience: "",
    platform: "Facebook",
    tone: "Professional",
    cta: "Contact Us",
    offer: "",
  });

  const [adCopy, setAdCopy] = useState(initialAdCopy);

  const [authLoading, setAuthLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await getCurrentUser();

        const currentUser =
          response?.user || response?.data?.user;

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
      } catch (authenticationError) {
        console.error(
          "Ad-copy authentication error:",
          authenticationError
        );

        router.replace("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthentication();
  }, [router]);

  const hasAdCopy = useMemo(() => {
    return Boolean(
      adCopy.headline ||
        adCopy.primaryText ||
        adCopy.description ||
        adCopy.cta
    );
  }, [adCopy]);

  const totalCharacters = useMemo(() => {
    return [
      adCopy.headline,
      adCopy.primaryText,
      adCopy.description,
      adCopy.cta,
    ].join("").length;
  }, [adCopy]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
    setSuccessMessage("");
  };

  const validateForm = () => {
    if (!formData.product.trim()) {
      setError("Please enter a product or service.");
      return false;
    }

    if (!formData.audience.trim()) {
      setError("Please enter the target audience.");
      return false;
    }

    return true;
  };

  const handleGenerate = async (event) => {
    event?.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setSuccessMessage("");
      setSaved(false);
      setCopied(false);

      const response = await generateBusinessAdCopy({
        goal: formData.goal,
        product: formData.product.trim(),
        audience: formData.audience.trim(),
        platform: formData.platform,
        tone: formData.tone,
        cta: formData.cta,
        offer: formData.offer.trim(),
      });

      const generatedAdCopy =
        response?.data?.adCopy || initialAdCopy;

      setAdCopy({
        headline: generatedAdCopy.headline || "",
        primaryText: generatedAdCopy.primaryText || "",
        description: generatedAdCopy.description || "",
        cta: generatedAdCopy.cta || formData.cta,
      });

      setSuccessMessage(
        "Your business ad copy has been generated."
      );
    } catch (generateError) {
      console.error(
        "Generate business ad-copy error:",
        generateError
      );

      setError(
        generateError.message ||
          "Unable to generate ad copy."
      );
    } finally {
      setGenerating(false);
    }
  };

  const getFormattedAdCopy = () => {
    return `Headline

${adCopy.headline}

Primary Text

${adCopy.primaryText}

Description

${adCopy.description}

CTA

${adCopy.cta}`;
  };

  const handleCopy = async () => {
    if (!hasAdCopy) return;

    try {
      await navigator.clipboard.writeText(
        getFormattedAdCopy()
      );

      setCopied(true);
      setError("");
      setSuccessMessage("Ad copy copied successfully.");

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (copyError) {
      console.error("Copy ad-copy error:", copyError);

      setError("Unable to copy the ad copy.");
    }
  };

  const handleSave = async () => {
    if (!hasAdCopy) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      await saveContent({
        type: "business-ad-copy",
        title: `${formData.product.trim()} ${
          formData.platform
        } Ad`,
        content: getFormattedAdCopy(),
        prompt: JSON.stringify(formData),
      });

      setSaved(true);
      setSuccessMessage(
        "Ad copy saved to your content library."
      );
    } catch (saveError) {
      console.error("Save ad-copy error:", saveError);

      setError(
        saveError.message ||
          "Unable to save the ad copy."
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030014] text-white">
        <div className="flex items-center gap-3 text-violet-300">
          <LoaderCircle
            size={25}
            className="animate-spin"
          />

          <span className="text-sm font-medium">
            Loading Ad Copy Generator...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030014] px-4 py-6 text-white sm:px-6 md:px-8">
      <div className="pointer-events-none absolute left-[-12%] top-[-12%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-[-12%] right-[-12%] h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8">
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                Business AI Tool
              </p>

              <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                Ad Copy Generator
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                Generate persuasive advertising copy for
                Facebook, Instagram, Google and LinkedIn
                campaigns.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
              <Megaphone
                size={22}
                className="text-violet-300"
              />

              <div>
                <p className="text-xs text-zinc-400">
                  AI-powered
                </p>

                <p className="text-sm font-semibold text-white">
                  Marketing copy
                </p>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl border border-white/10 bg-[#0a0520]/65 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                <Target size={21} />
              </div>

              <div>
                <h2 className="font-bold text-white">
                  Campaign details
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Provide details about your advertisement.
                </p>
              </div>
            </div>

            <SelectField
              label="Campaign goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              options={campaignGoals}
            />

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Product or service
              </label>

              <textarea
                name="product"
                value={formData.product}
                onChange={handleChange}
                rows={4}
                placeholder="Example: Website development service for local businesses"
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Target audience
              </label>

              <input
                type="text"
                name="audience"
                value={formData.audience}
                onChange={handleChange}
                placeholder="Example: Small business owners in Patna"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Advertising platform"
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

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Offer
                <span className="ml-2 text-xs font-normal text-zinc-600">
                  Optional
                </span>
              </label>

              <input
                type="text"
                name="offer"
                value={formData.offer}
                onChange={handleChange}
                placeholder="Example: Free consultation"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
              />

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                Leave this empty when your campaign does not
                include a specific offer.
              </p>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Generating ad copy...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate ad copy
                </>
              )}
            </button>
          </form>

          <section className="flex min-h-[620px] flex-col rounded-3xl border border-white/10 bg-[#0a0520]/65 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                  Generated Advertisement
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  Your ad copy
                </h2>
              </div>

              {hasAdCopy && (
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400">
                  {totalCharacters} characters
                </div>
              )}
            </div>

            {hasAdCopy ? (
              <>
                <div className="mt-6 flex-1 space-y-4">
                  <OutputCard
                    label="Headline"
                    value={adCopy.headline}
                    icon={<Megaphone size={18} />}
                  />

                  <OutputCard
                    label="Primary Text"
                    value={adCopy.primaryText}
                    icon={<FileText size={18} />}
                    large
                  />

                  <OutputCard
                    label="Description"
                    value={adCopy.description}
                    icon={<FileText size={18} />}
                  />

                  <OutputCard
                    label="Call to Action"
                    value={adCopy.cta}
                    icon={<Target size={18} />}
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20"
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <Check size={17} />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Save
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generating ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCw size={17} />
                    )}

                    Regenerate
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                  <Megaphone size={34} />
                </div>

                <h2 className="mt-6 text-xl font-bold text-white">
                  Your advertisement will appear here
                </h2>

                <p className="mt-3 max-w-md text-sm leading-7 text-zinc-500">
                  Enter your product, audience, campaign goal
                  and platform. Trendora will generate a
                  complete advertisement for your business.
                </p>

                <div className="mt-7 grid w-full max-w-md grid-cols-2 gap-3">
                  <EmptyPreview label="Headline" />
                  <EmptyPreview label="Primary text" />
                  <EmptyPreview label="Description" />
                  <EmptyPreview label="CTA" />
                </div>
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

function OutputCard({
  label,
  value,
  icon,
  large = false,
}) {
  return (
    <article
      className={`rounded-2xl border border-white/10 bg-[#120f2e]/55 p-5 ${
        large ? "min-h-[180px]" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-violet-300">
        {icon}

        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          {label}
        </p>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-zinc-300">
        {value || "Not generated"}
      </p>

      <p className="mt-4 text-right text-xs text-zinc-600">
        {(value || "").length} characters
      </p>
    </article>
  );
}

function EmptyPreview({ label }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-4 text-xs text-zinc-600">
      {label}
    </div>
  );
}