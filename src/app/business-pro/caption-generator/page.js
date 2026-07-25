"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, PenTool, Clipboard, Check } from "lucide-react";
import { generateBusinessProCaption } from "@/services/business-pro.api";

export default function BusinessProCaptionGenerator() {
  const [formData, setFormData] = useState({
    topic: "",
    platform: "Instagram",
    tone: "Professional",
    cta: "DM Us",
    emoji: true
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setResult(null);
      const res = await generateBusinessProCaption(formData);
      setResult(res.data.caption);
    } catch (err) {
      setError(err.message || "Failed to generate caption.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-amber-50/30 p-4 font-sans sm:p-8">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl sm:p-10">
        <Link href="/business-pro/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="mb-2 text-3xl font-black text-zinc-900">Pro Caption Writer</h1>
        <p className="mb-8 text-zinc-500">Write engaging captions for your business.</p>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-bold text-zinc-700">Caption Topic</label>
            <input required type="text" placeholder="e.g. New cafe opening in Mumbai" className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Platform</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})}>
                {["Instagram", "Facebook", "LinkedIn", "Google Business"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Tone</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.tone} onChange={(e) => setFormData({...formData, tone: e.target.value})}>
                {["Professional", "Friendly", "Promotional", "Luxury", "Casual", "Emotional"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Call to Action</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.cta} onChange={(e) => setFormData({...formData, cta: e.target.value})}>
                {["DM Us", "Call Now", "Book Today", "Visit Store", "Contact Us", "Learn More"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" className="h-5 w-5 accent-amber-600" checked={formData.emoji} onChange={(e) => setFormData({...formData, emoji: e.target.checked})} />
              <label className="text-sm font-bold text-zinc-700">Include Emojis</label>
            </div>
          </div>

          <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 p-4 font-bold text-white hover:bg-amber-700 disabled:opacity-50">
            {loading ? <LoaderCircle className="animate-spin" /> : <PenTool />} Generate Caption
          </button>
        </form>

        {result && (
          <div className="mt-8 rounded-2xl bg-zinc-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-zinc-800">Generated Caption</h3>
              <button onClick={handleCopy} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-600 shadow-sm">
                {copied ? <Check size={16} /> : <Clipboard size={16} />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-zinc-700">{result}</pre>
          </div>
        )}
      </div>
    </main>
  );
}
