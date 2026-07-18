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
      <main className="flex min-h-screen items-center justify-center bg-[#030014] text-white">
        <LoaderCircle
          size={28}
          className="animate-spin text-emerald-400"
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030014] px-4 py-6 text-white sm:px-6 md:px-8">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8">
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Business AI Tool
              </p>

              <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                WhatsApp Reply Generator
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                Generate professional customer support,
                sales and inquiry replies for WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
              <MessageCircle
                size={23}
                className="text-emerald-300"
              />

              <div>
                <p className="text-xs text-zinc-400">
                  Smart business messaging
                </p>

                <p className="text-sm font-semibold">
                  WhatsApp assistant
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                <Send size={20} />
              </div>

              <div>
                <h2 className="font-bold">
                  Customer message details
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Enter the received message and select
                  the reply style.
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-semibold text-zinc-300">
              Customer Message
              <span className="ml-1 text-red-400">*</span>
            </label>

            <textarea
              name="customerMessage"
              value={formData.customerMessage}
              onChange={handleChange}
              rows={6}
              placeholder="Hi, I need a website for my business. What is the price?"
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
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

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">
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
                  className="h-5 w-5 accent-emerald-500"
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
              <label className="mb-2 block text-sm font-semibold text-zinc-300">
                Additional Business Context
              </label>

              <textarea
                name="additionalContext"
                value={formData.additionalContext}
                onChange={handleChange}
                rows={4}
                placeholder="We create business websites. Pricing depends on the required pages and features."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-5 py-3.5 text-sm font-bold disabled:opacity-50"
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

          <section className="flex min-h-[700px] flex-col rounded-3xl border border-white/10 bg-[#0a0520]/65 p-5 backdrop-blur-xl sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Generated Replies
              </p>

              <h2 className="mt-2 text-xl font-bold">
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300"
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold disabled:opacity-50"
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
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <MessageCircle size={35} />
                </div>

                <h2 className="mt-6 text-xl font-bold">
                  Your reply will appear here
                </h2>

                <p className="mt-3 max-w-md text-sm leading-7 text-zinc-500">
                  Enter the customer message and choose
                  the preferred tone, language and length.
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
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
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
        className="w-full rounded-xl border border-white/10 bg-[#100b28] px-4 py-3 text-sm outline-none focus:border-emerald-500/50"
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
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          {label}
        </p>

        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10"
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