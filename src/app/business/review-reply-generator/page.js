"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  Clipboard,
  LoaderCircle,
  MessageSquareReply,
  RefreshCw,
  Save,
  Sparkles,
  Star,
} from "lucide-react";

import { getCurrentUser } from "@/services/auth.api";
import { saveContent } from "@/services/saved.api";
import { generateBusinessReviewReply } from "@/services/business-review-reply.api";

const initialForm = {
  platform: "Google",
  rating: 5,
  customerName: "",
  review: "",
  tone: "Professional",
  language: "English",
  length: "Medium",
  includeBusinessName: true,
  additionalContext: "",
};

const initialReply = {
  reply: "",
  alternativeReply: "",
  privateFollowUp: "",
};

export default function ReviewReplyGeneratorPage() {
  const router = useRouter();

  const [formData, setFormData] = useState(initialForm);
  const [generatedReply, setGeneratedReply] = useState(initialReply);

  const [authLoading, setAuthLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [copiedField, setCopiedField] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response = await getCurrentUser();

        const currentUser =
          response?.user ||
          response?.data?.user;

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
      } catch {
        router.replace("/login");
      } finally {
        setAuthLoading(false);
      }
    }

    checkAuthentication();
  }, [router]);

  const hasGeneratedReply = useMemo(() => {
    return Boolean(generatedReply.reply);
  }, [generatedReply.reply]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setSaved(false);
    setError("");
    setSuccess("");
  }

  function handleRatingChange(rating) {
    setFormData((current) => ({
      ...current,
      rating,
    }));

    setSaved(false);
    setError("");
    setSuccess("");
  }

  function validateForm() {
    if (!formData.review.trim()) {
      setError("Please enter the customer review.");
      return false;
    }

    if (
      Number(formData.rating) < 1 ||
      Number(formData.rating) > 5
    ) {
      setError("Please select a valid rating.");
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
      setCopiedField("");

      const response =
        await generateBusinessReviewReply({
          ...formData,
          rating: Number(formData.rating),
          customerName:
            formData.customerName.trim(),
          review: formData.review.trim(),
          additionalContext:
            formData.additionalContext.trim(),
        });

      const result =
        response?.data?.generatedReply;

      if (!result?.reply) {
        throw new Error(
          "AI did not return a valid review reply."
        );
      }

      setGeneratedReply({
        reply: result.reply || "",
        alternativeReply:
          result.alternativeReply || "",
        privateFollowUp:
          result.privateFollowUp || "",
      });

      setSuccess(
        "Review reply generated successfully."
      );
    } catch (generateError) {
      setError(
        generateError.message ||
          "Unable to generate review reply."
      );
    } finally {
      setGenerating(false);
    }
  }

  function getFormattedContent() {
    return `Platform

${formData.platform}

Rating

${formData.rating} out of 5 stars

Customer Review

${formData.review}

Main Public Reply

${generatedReply.reply}

Alternative Public Reply

${generatedReply.alternativeReply}

Private Follow-up

${generatedReply.privateFollowUp}`;
  }

  async function handleCopy(field, value) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopiedField(field);
      setError("");
      setSuccess("Reply copied successfully.");

      window.setTimeout(() => {
        setCopiedField("");
      }, 1800);
    } catch {
      setError("Unable to copy the reply.");
    }
  }

  async function handleCopyAll() {
    if (!hasGeneratedReply) return;

    try {
      await navigator.clipboard.writeText(
        getFormattedContent()
      );

      setCopiedField("all");
      setError("");
      setSuccess(
        "All review replies copied successfully."
      );

      window.setTimeout(() => {
        setCopiedField("");
      }, 1800);
    } catch {
      setError("Unable to copy the replies.");
    }
  }

  async function handleSave() {
    if (!hasGeneratedReply) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const titleCustomer =
        formData.customerName.trim() ||
        `${formData.rating}-Star Customer`;

      await saveContent({
        type: "review-reply",

        title: `Review Reply - ${formData.platform} - ${titleCustomer}`,

        prompt: JSON.stringify(formData),

        // Tumhara saved API "content" expect karta hai
        content: getFormattedContent(),
      });

      setSaved(true);
      setSuccess(
        "Review reply saved successfully."
      );
    } catch (saveError) {
      setError(
        saveError.message ||
          "Unable to save review reply."
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030014] text-white">
        <LoaderCircle
          size={30}
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
                Review Reply Generator
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                Generate professional replies for positive,
                neutral and negative customer reviews.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
              <MessageSquareReply
                size={23}
                className="text-violet-300"
              />

              <div>
                <p className="text-xs text-zinc-400">
                  Reputation management
                </p>

                <p className="text-sm font-semibold">
                  Smart review responses
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

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl border border-white/10 bg-[#0a0520]/65 p-5 backdrop-blur-xl sm:p-6"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                <Star size={20} />
              </div>

              <div>
                <h2 className="font-bold">
                  Customer review details
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Add the review and choose the response
                  style.
                </p>
              </div>
            </div>

            <SelectField
              label="Review Platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              options={[
                "Google",
                "Facebook",
                "Instagram",
                "Amazon",
                "Flipkart",
                "Meesho",
                "Zomato",
                "Swiggy",
                "Tripadvisor",
                "Other",
              ]}
            />

            <div className="mt-5">
              <label className="mb-3 block text-sm font-semibold text-zinc-300">
                Customer Rating
              </label>

              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const active =
                    rating <=
                    Number(formData.rating);

                  return (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        handleRatingChange(rating)
                      }
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                        active
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                          : "border-white/10 bg-white/[0.03] text-zinc-600 hover:text-amber-300"
                      }`}
                    >
                      <Star
                        size={20}
                        fill={
                          active
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-xs text-zinc-500">
                Selected: {formData.rating} out of 5
              </p>
            </div>

            <div className="mt-5">
              <InputField
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Rahul"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Customer Review
                <span className="ml-1 text-red-400">
                  *
                </span>
              </label>

              <textarea
                name="review"
                value={formData.review}
                onChange={handleChange}
                rows={6}
                placeholder="Delivery was late and customer support did not respond."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Reply Tone"
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                options={[
                  "Professional",
                  "Friendly",
                  "Apologetic",
                  "Warm",
                  "Premium",
                  "Formal",
                ]}
              />

              <SelectField
                label="Language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                options={[
                  "English",
                  "Hindi",
                  "Hinglish",
                ]}
              />

              <SelectField
                label="Reply Length"
                name="length"
                value={formData.length}
                onChange={handleChange}
                options={[
                  "Short",
                  "Medium",
                  "Detailed",
                ]}
              />
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
                    Include Business Name
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Allow AI to mention your business
                    name in the reply.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="includeBusinessName"
                  checked={
                    formData.includeBusinessName
                  }
                  onChange={handleChange}
                  className="h-5 w-5 accent-violet-500"
                />
              </label>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Additional Context
              </label>

              <textarea
                name="additionalContext"
                value={formData.additionalContext}
                onChange={handleChange}
                rows={4}
                placeholder="Ask the customer to contact support privately with their order number."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-3.5 text-sm font-bold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Generating reply...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Review Reply
                </>
              )}
            </button>
          </form>

          <section className="flex min-h-[720px] flex-col rounded-3xl border border-white/10 bg-[#0a0520]/65 p-5 backdrop-blur-xl sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                Generated Responses
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Professional review replies
              </h2>
            </div>

            {hasGeneratedReply ? (
              <>
                <div className="mt-6 flex-1 space-y-4">
                  <ReplyCard
                    label="Main Public Reply"
                    value={generatedReply.reply}
                    copied={
                      copiedField === "main"
                    }
                    onCopy={() =>
                      handleCopy(
                        "main",
                        generatedReply.reply
                      )
                    }
                  />

                  {generatedReply.alternativeReply && (
                    <ReplyCard
                      label="Alternative Public Reply"
                      value={
                        generatedReply.alternativeReply
                      }
                      copied={
                        copiedField ===
                        "alternative"
                      }
                      onCopy={() =>
                        handleCopy(
                          "alternative",
                          generatedReply.alternativeReply
                        )
                      }
                    />
                  )}

                  {generatedReply.privateFollowUp && (
                    <ReplyCard
                      label="Private Follow-up"
                      value={
                        generatedReply.privateFollowUp
                      }
                      copied={
                        copiedField === "private"
                      }
                      onCopy={() =>
                        handleCopy(
                          "private",
                          generatedReply.privateFollowUp
                        )
                      }
                    />
                  )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300"
                  >
                    {copiedField === "all" ? (
                      <>
                        <Check size={17} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Clipboard size={17} />
                        Copy All
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || saved}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300 disabled:opacity-50"
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
                    disabled={generating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold disabled:opacity-50"
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
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                  <MessageSquareReply size={35} />
                </div>

                <h2 className="mt-6 text-xl font-bold">
                  Your replies will appear here
                </h2>

                <p className="mt-3 max-w-md text-sm leading-7 text-zinc-500">
                  Enter the customer review, select the
                  rating and response style, then generate
                  a professional reply.
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
      <label className="mb-2 block text-sm font-semibold text-zinc-300">
        {label}
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
        className="w-full rounded-xl border border-white/10 bg-[#100b28] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
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

function ReplyCard({
  label,
  value,
  copied,
  onCopy,
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#120f2e]/55 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
          {label}
        </p>

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied
            </>
          ) : (
            <>
              <Clipboard size={14} />
              Copy
            </>
          )}
        </button>
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