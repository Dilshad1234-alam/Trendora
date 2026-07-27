"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, CheckCircle2, Settings, MessageSquareText, Save, Crown } from "lucide-react";

export default function BrandVoicePage() {
  const [tone, setTone] = useState("Professional");
  const [instructions, setInstructions] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const tones = [
    "Professional", "Playful & Fun", "Sarcastic & Witty", "Friendly & Casual",
    "Luxurious & Premium", "Bold & Direct", "Educational & Informative"
  ];

  useEffect(() => {
    fetchVoiceSettings();
  }, []);

  const fetchVoiceSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/business-pro/brand-voice");
      const data = await res.json();
      
      if (res.ok) {
        setTone(data.brandVoiceTone || "Professional");
        setInstructions(data.brandVoiceInstructions || "");
      }
    } catch (error) {
      console.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/business-pro/brand-voice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandVoiceTone: tone, brandVoiceInstructions: instructions }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Brand Voice saved successfully! AI will now use this tone." });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update settings." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center">
        <LoaderCircle className="animate-spin text-violet-700 mb-4" size={32} />
        <span className="font-medium text-zinc-600">Loading settings...</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[800px] max-w-full -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10">
          <Link href="/business-pro/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-6 transition">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <MessageSquareText size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full border border-violet-200">
                  <Crown size={12} /> PRO FEATURE
                </span>
              </div>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-950">
                Brand Voice Customization
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Train the AI to speak exactly like your brand.
              </p>
            </div>
          </div>
        </header>

        {message.text && (
          <div className={`mb-8 rounded-xl p-4 flex items-center gap-3 border ${message.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
            {message.type === "error" ? <LoaderCircle className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Tone Selection */}
            <div>
              <h2 className="text-lg font-bold text-zinc-900 mb-4">Select Primary Tone</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`flex items-center justify-center py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                      tone === t 
                        ? "bg-violet-700 border-violet-700 text-white shadow-md shadow-violet-200" 
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Settings size={18} className="text-violet-700" />
                <h2 className="text-lg font-bold text-zinc-900">Custom AI Instructions (Optional)</h2>
              </div>
              <p className="text-sm text-zinc-600 mb-4">
                Provide specific rules for the AI. E.g., "Always use emojis, never use formal language, mention our free shipping."
              </p>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={6}
                placeholder="Write your custom instructions here..."
                className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none font-medium"
              />
            </div>

            <div className="pt-6 border-t border-zinc-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-8 py-4 font-bold text-white transition hover:bg-violet-800 disabled:opacity-50 shadow-lg shadow-violet-200"
              >
                {saving ? <LoaderCircle className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? "Saving Configuration..." : "Save Brand Voice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
