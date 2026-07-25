"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, PenTool, Clipboard, Check } from "lucide-react";
import { generateBusinessProAdCopy } from "@/services/business-pro.api";

export default function BusinessProAdCopyGenerator() {
  const [formData, setFormData] = useState({
    topic: "",
    platform: "Facebook Ads",
    objective: "Generate Leads",
    tone: "Professional",
    cta: "Learn More",
    offer: ""
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
      const res = await generateBusinessProAdCopy(formData);
      setResult(res.data.adCopy);
    } catch (err) {
      setError(err.message || "Failed to generate ad copy.");
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
        <h1 className="mb-2 text-3xl font-black text-zinc-900">Pro Ad Copy Generator</h1>
        <p className="mb-8 text-zinc-500">Generate converting ad copies instantly.</p>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-bold text-zinc-700">Advertisement Topic</label>
            <input required type="text" placeholder="e.g. Summer sale on gym memberships" className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Platform</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})}>
                {["Facebook Ads", "Instagram Ads", "Google Ads", "LinkedIn Ads"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Objective</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.objective} onChange={(e) => setFormData({...formData, objective: e.target.value})}>
                {["Generate Leads", "Increase Sales", "Website Traffic", "Brand Awareness", "Get Messages", "Promote Offer"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Tone</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.tone} onChange={(e) => setFormData({...formData, tone: e.target.value})}>
                {["Professional", "Friendly", "Persuasive", "Urgent", "Luxury", "Emotional"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Call to Action</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.cta} onChange={(e) => setFormData({...formData, cta: e.target.value})}>
                {["Learn More", "Contact Us", "Book Now", "Shop Now", "Call Now", "Send Message", "Get Offer"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-zinc-700">Offer (Optional)</label>
            <input type="text" placeholder="e.g. 20% off for first 50 customers" className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.offer} onChange={(e) => setFormData({...formData, offer: e.target.value})} />
          </div>

          <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 p-4 font-bold text-white hover:bg-amber-700 disabled:opacity-50">
            {loading ? <LoaderCircle className="animate-spin" /> : <PenTool />} Generate Ad Copy
          </button>
        </form>

        {result && (
          <div className="mt-8 rounded-2xl bg-zinc-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-zinc-800">Generated Ad Copy</h3>
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
