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
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

import { getCurrentUser } from "@/services/auth.api";
import { saveContent } from "@/services/saved.api";

import {
  generateBusinessWhatsappReply,
} from "@/services/business-whatsapp-reply.api";

const initialReply = {
  reply: "",
  alternativeReply: "",
  followUpMessage: "",
};

export default function WhatsappReplyGeneratorPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    customerMessage: "",
    tone: "Professional",
    language: "Hinglish",
    length: "Medium",
    includeCta: true,
    cta: "",
    additionalContext: "",
  });

  const [generatedReply, setGeneratedReply] =
    useState(initialReply);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [copiedField, setCopiedField] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    async function checkUser() {
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

    checkUser();
  }, [router]);

  const hasReply = useMemo(() => {
    return Boolean(generatedReply.reply);
  }, [generatedReply]);

  function handleChange(event) {
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
    setSuccess("");
  }

  function validateForm() {
    if (!formData.customerMessage.trim()) {
      setError(
        "Please enter the customer message."
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
      setCopiedField("");

      const response =
        await generateBusinessWhatsappReply({
          ...formData,
          customerMessage:
            formData.customerMessage.trim(),
          cta: formData.cta.trim(),
          additionalContext:
            formData.additionalContext.trim(),
        });

      setGeneratedReply(
        response?.data?.generatedReply ||
          initialReply
      );

      setSuccess(
        "WhatsApp reply generated successfully."
      );
    } catch (generateError) {
      setError(
        generateError.message ||
          "Unable to generate WhatsApp reply."
      );
    } finally {
      setGenerating(false);
    }
  }

  function getFormattedContent() {
    return `Customer Message

${formData.customerMessage}

Main Reply

${generatedReply.reply}

Alternative Reply

${generatedReply.alternativeReply}

Follow-up Message

${generatedReply.followUpMessage}`;
  }

  async function handleCopy(field, value) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);

      setCopiedField(field);
      setSuccess("Reply copied successfully.");
      setError("");

      window.setTimeout(() => {
        setCopiedField("");
      }, 1800);
    } catch {
      setError("Unable to copy the reply.");
    }
  }

  async function handleCopyAll() {
    if (!hasReply) return;

    try {
      await navigator.clipboard.writeText(
        getFormattedContent()
      );

      setCopiedField("all");
      setSuccess("All replies copied successfully.");

      window.setTimeout(() => {
        setCopiedField("");
      }, 1800);
    } catch {
      setError("Unable to copy replies.");
    }
  }

  async function handleSave() {
    if (!hasReply) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await saveContent({
        type: "whatsapp-reply",
        title: "WhatsApp Customer Reply" ,
        prompt: JSON.stringify(formData),
        content: getFormattedContent(),
      });

      setSaved(true);
      setSuccess(
        "WhatsApp reply saved successfully."
      );
    } catch (saveError) {
      setError(
        saveError.message ||
          "Unable to save WhatsApp reply."
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
    <main className="min-h-screen bg-white text-zinc-900 font-sans relative">
      <div className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 transition-colors"
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
                WhatsApp Reply Generator
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600">
                Generate professional customer support, sales and inquiry replies for WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 shadow-sm">
              <MessageCircle
                size={23}
                className="text-violet-700"
              />

              <div>
                <p className="text-xs text-zinc-500 font-medium">
                  Smart business messaging
                </p>

                <p className="text-sm font-bold text-zinc-900">
                  WhatsApp assistant
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

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Send size={20} />
              </div>

              <div>
                <h2 className="font-bold text-zinc-900">
                  Customer message details
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Enter the received message and select the reply style.
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-semibold text-zinc-700">
              Customer Message
              <span className="ml-1 text-red-500">*</span>
            </label>

            <textarea
              name="customerMessage"
              value={formData.customerMessage}
              onChange={handleChange}
              rows={6}
              placeholder="Hi, I need a website for my business. What is the price?"
              className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Reply Tone"
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                options={[
                  "Professional",
                  "Friendly",
                  "Sales",
                  "Support",
                  "Apologetic",
                  "Premium",
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

            <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Include Call to Action
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Ask the customer to take the next step.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="includeCta"
                  checked={formData.includeCta}
                  onChange={handleChange}
                  className="h-5 w-5 accent-violet-600"
                />
              </label>
            </div>

            {formData.includeCta && (
              <div className="mt-5">
                <InputField
                  label="Call to Action"
                  name="cta"
                  value={formData.cta}
                  onChange={handleChange}
                  placeholder="Please share your requirements with us."
                />
              </div>
            )}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-zinc-700">
                Additional Business Context
              </label>

              <textarea
                name="additionalContext"
                value={formData.additionalContext}
                onChange={handleChange}
                rows={4}
                placeholder="We create business websites. Pricing depends on the required pages and features."
                className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-800 disabled:opacity-50"
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
                  Generate WhatsApp Reply
                </>
              )}
            </button>
          </form>

          <section className="flex min-h-[700px] flex-col rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
                Generated Replies
              </p>

              <h2 className="mt-2 text-xl font-bold text-zinc-900">
                Ready-to-send messages
              </h2>
            </div>

            {hasReply ? (
              <>
                <div className="mt-6 flex-1 space-y-4">
                  <ReplyCard
                    label="Main Reply"
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
                      label="Alternative Reply"
                      value={
                        generatedReply.alternativeReply
                      }
                      copied={
                        copiedField === "alternative"
                      }
                      onCopy={() =>
                        handleCopy(
                          "alternative",
                          generatedReply.alternativeReply
                        )
                      }
                    />
                  )}

                  {generatedReply.followUpMessage && (
                    <ReplyCard
                      label="Follow-up Message"
                      value={
                        generatedReply.followUpMessage
                      }
                      copied={
                        copiedField === "followup"
                      }
                      onCopy={() =>
                        handleCopy(
                          "followup",
                          generatedReply.followUpMessage
                        )
                      }
                    />
                  )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800 transition-colors disabled:opacity-50"
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
                  <MessageCircle size={35} />
                </div>

                <h2 className="mt-6 text-xl font-bold text-zinc-900">
                  Your reply will appear here
                </h2>

                <p className="mt-3 max-w-md text-sm leading-7 text-zinc-500">
                  Enter the customer message and choose the preferred tone, language and length.
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
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
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
    <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
          {label}
        </p>

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors shadow-sm animate-fade-in"
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

      <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-zinc-700">
        {value}
      </p>

      <p className="mt-4 text-right text-xs text-zinc-400">
        {(value || "").length} characters
      </p>
    </article>
  );
}