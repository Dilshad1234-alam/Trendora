"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  Clipboard,
  FileSearch,
  Globe2,
  KeyRound,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  RefreshCw,
  Save,
  Search,
  Sparkles,
} from "lucide-react";

import { getCurrentUser } from "@/services/auth.api";
import { saveContent } from "@/services/saved.api";

import {
  generateBusinessLocalSeo,
} from "@/services/business-local-seo.api";

const initialSeoContent = {
  googleBusinessDescription: "",
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  faqs: [],
  localSeoTips: [],
};

export default function BusinessLocalSeoGeneratorPage() {
  const router = useRouter();

  const [formData, setFormData] =
    useState({
      businessName: "",
      businessType: "",
      city: "",
      services: "",
      targetKeyword: "",
      audience: "",
    });

  const [seoContent, setSeoContent] =
    useState(initialSeoContent);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const checkUser = async () => {
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
      } catch {
        router.replace("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const hasSeoContent = useMemo(() => {
    return Boolean(
      seoContent.googleBusinessDescription ||
        seoContent.metaTitle ||
        seoContent.metaDescription
    );
  }, [seoContent]);

  function handleChange(event) {
    const { name, value } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
    setSuccess("");
  }

  function validateForm() {
    if (
      !formData.targetKeyword.trim()
    ) {
      setError(
        "Please enter a target keyword."
      );
      return false;
    }

    return true;
  }

  async function handleGenerate(event) {
    event?.preventDefault();

    if (!validateForm()) return;

    try {
      setGenerating(true);
      setError("");
      setSuccess("");
      setSaved(false);
      setCopied(false);

      const response =
        await generateBusinessLocalSeo({
          ...formData,
          businessName:
            formData.businessName.trim(),
          businessType:
            formData.businessType.trim(),
          city:
            formData.city.trim(),
          services:
            formData.services.trim(),
          targetKeyword:
            formData.targetKeyword.trim(),
          audience:
            formData.audience.trim(),
        });

      setSeoContent(
        response?.data?.seoContent ||
          initialSeoContent
      );

      setSuccess(
        "Local SEO content generated successfully."
      );
    } catch (generateError) {
      setError(
        generateError.message ||
          "Unable to generate local SEO content."
      );
    } finally {
      setGenerating(false);
    }
  }

  function getFormattedContent() {
    const keywords =
      seoContent.keywords
        .map((item) => `- ${item}`)
        .join("\n");

    const faqs =
      seoContent.faqs
        .map(
          (item, index) =>
            `${index + 1}. ${item.question}\n${item.answer}`
        )
        .join("\n\n");

    const tips =
      seoContent.localSeoTips
        .map((item) => `- ${item}`)
        .join("\n");

    return `Google Business Description

${seoContent.googleBusinessDescription}

Meta Title

${seoContent.metaTitle}

Meta Description

${seoContent.metaDescription}

SEO Keywords

${keywords}

FAQs

${faqs}

Local SEO Tips

${tips}`;
  }

  async function handleCopy() {
    if (!hasSeoContent) return;

    try {
      await navigator.clipboard.writeText(
        getFormattedContent()
      );

      setCopied(true);
      setError("");
      setSuccess(
        "Local SEO content copied."
      );

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setError(
        "Unable to copy SEO content."
      );
    }
  }

  async function handleSave() {
    if (!hasSeoContent) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await saveContent({
        type: "local-seo",
        title: `${
          formData.targetKeyword.trim()
        } Local SEO`,
        content:
          getFormattedContent(),
        prompt:
          JSON.stringify(formData),
      });

      setSaved(true);
      setSuccess(
        "Local SEO content saved successfully."
      );
    } catch (saveError) {
      setError(
        saveError.message ||
          "Unable to save SEO content."
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030014] text-white">
        <LoaderCircle
          size={26}
          className="animate-spin text-violet-400"
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030014] px-4 py-6 text-white sm:px-6 md:px-8">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8">
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-white"
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
                Local SEO Generator
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                Generate local SEO content,
                Google Business descriptions,
                meta tags, keywords and FAQs.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
              <Globe2
                size={22}
                className="text-violet-300"
              />

              <div>
                <p className="text-xs text-zinc-400">
                  Search visibility
                </p>

                <p className="text-sm font-semibold">
                  Local SEO assistant
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

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl border border-white/10 bg-[#0a0520]/65 p-5 backdrop-blur-xl sm:p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                <Search size={21} />
              </div>

              <div>
                <h2 className="font-bold">
                  SEO details
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Enter your business and
                  keyword details.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Business name"
                name="businessName"
                value={
                  formData.businessName
                }
                onChange={handleChange}
                placeholder="Dilshad Web Solutions"
              />

              <InputField
                label="Business type"
                name="businessType"
                value={
                  formData.businessType
                }
                onChange={handleChange}
                placeholder="Website Development Company"
              />
            </div>

            <div className="mt-5">
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Patna"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Services
              </label>

              <textarea
                name="services"
                value={formData.services}
                onChange={handleChange}
                rows={4}
                placeholder="Website Development, SEO, Digital Marketing"
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
              />
            </div>

            <div className="mt-5">
              <InputField
                label="Target keyword"
                name="targetKeyword"
                value={
                  formData.targetKeyword
                }
                onChange={handleChange}
                placeholder="Website Development Company in Patna"
                required
              />
            </div>

            <div className="mt-5">
              <InputField
                label="Target audience"
                name="audience"
                value={formData.audience}
                onChange={handleChange}
                placeholder="Small business owners and startups"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-3.5 text-sm font-bold disabled:opacity-50"
            >
              {generating ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Generating SEO content...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate local SEO
                </>
              )}
            </button>
          </form>

          <section className="flex min-h-[700px] flex-col rounded-3xl border border-white/10 bg-[#0a0520]/65 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                  Generated SEO Content
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Your local SEO package
                </h2>
              </div>

              {hasSeoContent && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400">
                  {
                    seoContent.keywords
                      .length
                  }{" "}
                  keywords
                </span>
              )}
            </div>

            {hasSeoContent ? (
              <>
                <div className="mt-6 flex-1 space-y-4">
                  <OutputCard
                    label="Google Business Description"
                    value={
                      seoContent.googleBusinessDescription
                    }
                    icon={
                      <Globe2 size={18} />
                    }
                  />

                  <OutputCard
                    label="Meta Title"
                    value={
                      seoContent.metaTitle
                    }
                    icon={
                      <FileSearch
                        size={18}
                      />
                    }
                  />

                  <OutputCard
                    label="Meta Description"
                    value={
                      seoContent.metaDescription
                    }
                    icon={
                      <FileSearch
                        size={18}
                      />
                    }
                  />

                  <ListCard
                    label="SEO Keywords"
                    items={
                      seoContent.keywords
                    }
                    icon={
                      <KeyRound
                        size={18}
                      />
                    }
                  />

                  <FaqCard
                    items={
                      seoContent.faqs
                    }
                  />

                  <ListCard
                    label="Local SEO Tips"
                    items={
                      seoContent.localSeoTips
                    }
                    icon={
                      <Lightbulb
                        size={18}
                      />
                    }
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300"
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 disabled:opacity-50"
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
                      <Save
                        size={17}
                      />
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
                    disabled={generating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold disabled:opacity-50"
                  >
                    {generating ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCw
                        size={17}
                      />
                    )}

                    Regenerate
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                  <Search size={34} />
                </div>

                <h2 className="mt-6 text-xl font-bold">
                  Your SEO content will
                  appear here
                </h2>

                <p className="mt-3 max-w-md text-sm leading-7 text-zinc-500">
                  Enter your business
                  details and target keyword
                  to generate a complete
                  local SEO package.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-300">
        {label}
        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
      />
    </div>
  );
}

function OutputCard({
  label,
  value,
  icon,
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#120f2e]/55 p-5">
      <div className="flex items-center gap-2 text-violet-300">
        {icon}

        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          {label}
        </p>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-zinc-300">
        {value}
      </p>

      <p className="mt-4 text-right text-xs text-zinc-600">
        {(value || "").length} characters
      </p>
    </article>
  );
}

function ListCard({
  label,
  items,
  icon,
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#120f2e]/55 p-5">
      <div className="flex items-center gap-2 text-violet-300">
        {icon}

        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          {label}
        </p>
      </div>

      <ul className="mt-4 space-y-3">
        {(items || []).map(
          (item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-3 text-sm leading-7 text-zinc-300"
            >
              <Check
                size={16}
                className="mt-1 shrink-0 text-emerald-400"
              />

              <span>{item}</span>
            </li>
          )
        )}
      </ul>
    </article>
  );
}

function FaqCard({ items }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#120f2e]/55 p-5">
      <div className="flex items-center gap-2 text-violet-300">
        <ListChecks size={18} />

        <p className="text-xs font-semibold uppercase tracking-[0.16em]">
          Frequently Asked Questions
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {(items || []).map(
          (item, index) => (
            <div
              key={`${item.question}-${index}`}
              className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
            >
              <p className="text-sm font-semibold text-white">
                {item.question}
              </p>

              <p className="mt-2 text-sm leading-7 text-zinc-400">
                {item.answer}
              </p>
            </div>
          )
        )}
      </div>
    </article>
  );
}