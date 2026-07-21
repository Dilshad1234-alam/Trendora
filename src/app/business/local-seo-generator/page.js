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
  Building2,
  Check,
  Clipboard,
  FileSearch,
  Globe2,
  KeyRound,
  ListChecks,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
} from "lucide-react";

import { getCurrentUser } from "@/services/auth.api";
import { saveContent } from "@/services/saved.api";

import {
  generateBusinessLocalSeo,
} from "@/services/business-local-seo.api";

const initialSeoContent = {
  primaryKeyword: "",
  relatedKeywords: [],

  googleBusinessCategories: {
    primary: "",
    secondary: [],
  },

  seoTitle: "",
  metaDescription: "",
  faqs: [],
  napChecklist: [],
  localSeoChecklist: [],
};

const initialFormData = {
  businessName: "",
  businessType: "",
  city: "",
  state: "",
  country: "India",
  services: "",
  audience: "",
};

export default function BusinessLocalSeoGeneratorPage() {
  const router = useRouter();

  const [formData, setFormData] =
    useState(initialFormData);

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
      seoContent.primaryKeyword ||
        seoContent.seoTitle ||
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
    setError("");
    setSuccess("");
  }

  function validateForm() {
    if (
      formData.businessName.trim() &&
      !formData.businessType.trim()
    ) {
      setError(
        "Please enter your business type."
      );

      return false;
    }

    return true;
  }

  async function handleGenerate(event) {
    event?.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setSuccess("");
      setSaved(false);
      setCopied(false);

      const response =
        await generateBusinessLocalSeo({
          businessName:
            formData.businessName.trim(),

          businessType:
            formData.businessType.trim(),

          city:
            formData.city.trim(),

          state:
            formData.state.trim(),

          country:
            formData.country.trim(),

          services:
            formData.services.trim(),

          audience:
            formData.audience.trim(),
        });

      const generatedSeo =
        response?.data?.seoContent;

      if (!generatedSeo) {
        throw new Error(
          "Local SEO package was not returned."
        );
      }

      setSeoContent({
        ...initialSeoContent,
        ...generatedSeo,

        googleBusinessCategories: {
          ...initialSeoContent.googleBusinessCategories,

          ...(generatedSeo.googleBusinessCategories ||
            {}),
        },
      });

      const input =
        response?.data?.input;

      if (input) {
        setFormData((current) => ({
          ...current,

          businessName:
            input.businessName ||
            current.businessName,

          businessType:
            input.businessType ||
            current.businessType,

          city:
            input.city ||
            current.city,

          state:
            input.state ||
            current.state,

          country:
            input.country ||
            current.country,

          services:
            input.services ||
            current.services,

          audience:
            input.audience ||
            current.audience,
        }));
      }

      setSuccess(
        "Local SEO package generated successfully."
      );
    } catch (generateError) {
      setError(
        generateError?.message ||
          "Unable to generate Local SEO package."
      );
    } finally {
      setGenerating(false);
    }
  }

  function getFormattedContent() {
    const relatedKeywords =
      seoContent.relatedKeywords
        .map((item) => `- ${item}`)
        .join("\n");

    const secondaryCategories =
      seoContent.googleBusinessCategories
        .secondary
        .map((item) => `- ${item}`)
        .join("\n");

    const faqs =
      seoContent.faqs
        .map(
          (item, index) =>
            `${index + 1}. ${item.question}\n${item.answer}`
        )
        .join("\n\n");

    const napChecklist =
      seoContent.napChecklist
        .map((item) => `- ${item}`)
        .join("\n");

    const seoChecklist =
      seoContent.localSeoChecklist
        .map(
          (item) =>
            `- [${item.priority}] ${item.task}`
        )
        .join("\n");

    return `PRIMARY LOCAL KEYWORD

${seoContent.primaryKeyword}

RELATED LOCAL KEYWORDS

${relatedKeywords}

GOOGLE BUSINESS PROFILE CATEGORIES

Primary category:
${seoContent.googleBusinessCategories.primary}

Secondary categories:
${secondaryCategories}

SEO TITLE

${seoContent.seoTitle}

META DESCRIPTION

${seoContent.metaDescription}

LOCAL FAQs

${faqs}

NAP CONSISTENCY CHECKLIST

${napChecklist}

LOCAL SEO ACTION CHECKLIST

${seoChecklist}`;
  }

  async function handleCopy() {
    if (!hasSeoContent) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        getFormattedContent()
      );

      setCopied(true);
      setError("");

      setSuccess(
        "Local SEO package copied."
      );

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setError(
        "Unable to copy Local SEO package."
      );
    }
  }

  async function handleSave() {
    if (!hasSeoContent) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const title =
        seoContent.primaryKeyword ||
        `${formData.businessName} Local SEO`;

      await saveContent({
        type: "local-seo",

        title:
          `${title} Package`.trim(),

        content:
          getFormattedContent(),

        prompt:
          JSON.stringify(formData),
      });

      setSaved(true);

      setSuccess(
        "Local SEO package saved successfully."
      );
    } catch (saveError) {
      setError(
        saveError?.message ||
          "Unable to save Local SEO package."
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white text-zinc-900">
        <LoaderCircle
          size={28}
          className="animate-spin text-violet-700"
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-white font-sans text-zinc-900">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[800px] max-w-full -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition-colors hover:text-violet-800"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
                Business AI Tool
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                Local SEO Generator
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">
                Generate local keywords, Google Business
                categories, meta tags, FAQs and a practical
                Local SEO checklist.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 shadow-sm">
              <Globe2
                size={22}
                className="text-violet-700"
              />

              <div>
                <p className="text-xs font-medium text-zinc-500">
                  Search visibility
                </p>

                <p className="text-sm font-bold text-zinc-900">
                  Local SEO assistant
                </p>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Search size={21} />
              </div>

              <div>
                <h2 className="font-bold text-zinc-900">
                  Business details
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Leave fields empty to use your onboarding
                  information.
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

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Patna"
              />

              <InputField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Bihar"
              />
            </div>

            <div className="mt-5">
              <InputField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="India"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Services
              </label>

              <textarea
                name="services"
                value={formData.services}
                onChange={handleChange}
                rows={4}
                placeholder="Website Development, SEO, Digital Marketing"
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
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

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-zinc-50 p-4 text-xs leading-6 text-zinc-500">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-violet-600"
              />

              <p>
                Trendora generates recommendations using the
                information provided. It does not access live
                Google rankings, search volume or competitor
                data.
              </p>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />

                  Generating Local SEO...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Local SEO
                </>
              )}
            </button>
          </form>

          <section className="flex min-h-[700px] flex-col rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
                  Generated SEO Content
                </p>

                <h2 className="mt-2 text-xl font-bold text-zinc-900">
                  Your Local SEO package
                </h2>
              </div>

              {hasSeoContent && (
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-500">
                  {
                    seoContent.relatedKeywords
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
                    label="Primary Local Keyword"
                    value={
                      seoContent.primaryKeyword
                    }
                    icon={
                      <MapPin size={18} />
                    }
                  />

                  <ListCard
                    label="Related Local Keywords"
                    items={
                      seoContent.relatedKeywords
                    }
                    icon={
                      <KeyRound size={18} />
                    }
                  />

                  <CategoriesCard
                    categories={
                      seoContent.googleBusinessCategories
                    }
                  />

                  <OutputCard
                    label="SEO Title"
                    value={
                      seoContent.seoTitle
                    }
                    icon={
                      <FileSearch size={18} />
                    }
                  />

                  <OutputCard
                    label="Meta Description"
                    value={
                      seoContent.metaDescription
                    }
                    icon={
                      <FileSearch size={18} />
                    }
                  />

                  <FaqCard
                    items={
                      seoContent.faqs
                    }
                  />

                  <ListCard
                    label="NAP Consistency Checklist"
                    items={
                      seoContent.napChecklist
                    }
                    icon={
                      <Building2 size={18} />
                    }
                  />

                  <ChecklistCard
                    items={
                      seoContent.localSeoChecklist
                    }
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100"
                  >
                    {copied ? (
                      <>
                        <Check size={17} />
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
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

                    {saved
                      ? "Saved"
                      : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-800 disabled:opacity-50"
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
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-violet-700">
                  <Search size={34} />
                </div>

                <h2 className="mt-6 text-xl font-bold text-zinc-900">
                  Your Local SEO package will appear here
                </h2>

                <p className="mt-3 max-w-md text-sm leading-7 text-zinc-500">
                  Generate local keywords, Google Business
                  categories, meta tags, FAQs, NAP checks and
                  practical SEO actions.
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
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-700">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
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
    <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-center gap-2 text-violet-700">
        {icon}

        <p className="text-xs font-bold uppercase tracking-[0.16em]">
          {label}
        </p>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-zinc-700">
        {value}
      </p>

      <p className="mt-4 text-right text-xs text-zinc-400">
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
    <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-center gap-2 text-violet-700">
        {icon}

        <p className="text-xs font-bold uppercase tracking-[0.16em]">
          {label}
        </p>
      </div>

      <ul className="mt-4 space-y-3">
        {(items || []).map(
          (item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-3 text-sm leading-7 text-zinc-700"
            >
              <Check
                size={16}
                className="mt-1 shrink-0 text-emerald-600"
              />

              <span>{item}</span>
            </li>
          )
        )}
      </ul>
    </article>
  );
}

function CategoriesCard({
  categories,
}) {
  const primary =
    categories?.primary || "";

  const secondary =
    categories?.secondary || [];

  return (
    <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-center gap-2 text-violet-700">
        <Tags size={18} />

        <p className="text-xs font-bold uppercase tracking-[0.16em]">
          Google Business Categories
        </p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Primary category
        </p>

        <div className="mt-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">
          {primary}
        </div>
      </div>

      {secondary.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Secondary categories
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {secondary.map(
              (item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function FaqCard({ items }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-center gap-2 text-violet-700">
        <ListChecks size={18} />

        <p className="text-xs font-bold uppercase tracking-[0.16em]">
          Local FAQs
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {(items || []).map(
          (item, index) => (
            <div
              key={`${item.question}-${index}`}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-bold text-zinc-900">
                {item.question}
              </p>

              <p className="mt-2 text-sm leading-7 text-zinc-600">
                {item.answer}
              </p>
            </div>
          )
        )}
      </div>
    </article>
  );
}

function ChecklistCard({ items }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-center gap-2 text-violet-700">
        <ListChecks size={18} />

        <p className="text-xs font-bold uppercase tracking-[0.16em]">
          Local SEO Action Checklist
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {(items || []).map(
          (item, index) => (
            <div
              key={`${item.task}-${index}`}
              className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex gap-3">
                <Check
                  size={16}
                  className="mt-1 shrink-0 text-emerald-600"
                />

                <p className="text-sm leading-7 text-zinc-700">
                  {item.task}
                </p>
              </div>

              <PriorityBadge
                priority={
                  item.priority
                }
              />
            </div>
          )
        )}
      </div>
    </article>
  );
}

function PriorityBadge({ priority }) {
  const classes = {
    High:
      "border-red-200 bg-red-50 text-red-700",

    Medium:
      "border-amber-200 bg-amber-50 text-amber-700",

    Low:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        classes[priority] ||
        classes.Medium
      }`}
    >
      {priority || "Medium"}
    </span>
  );
}