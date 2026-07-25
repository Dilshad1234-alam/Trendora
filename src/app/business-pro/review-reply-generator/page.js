"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Star, Clipboard, Check } from "lucide-react";
import { generateBusinessProReviewReply } from "@/services/business-pro.api";

export default function BusinessProReviewReplyGenerator() {
  const [formData, setFormData] = useState({
    platform: "Google",
    rating: 5,
    customerName: "",
    review: "",
    tone: "Professional",
    language: "English",
    length: "Medium",
    includeBusinessName: true,
    additionalContext: ""
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
      const res = await generateBusinessProReviewReply(formData);
      setResult(res.data.generatedReply);
    } catch (err) {
      setError(err.message || "Failed to generate review reply.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-amber-50/30 p-4 font-sans sm:p-8">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl sm:p-10">
        <Link href="/business-pro/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="mb-2 text-3xl font-black text-zinc-900">Pro Review Replier</h1>
        <p className="mb-8 text-zinc-500">Respond to customer reviews professionally.</p>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Platform</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})}>
                {["Google", "Facebook", "Instagram", "Amazon", "Flipkart", "Meesho", "Zomato", "Swiggy", "Tripadvisor", "Other"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Rating (out of 5)</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.rating} onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}>
                {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r} Stars</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-zinc-700">Customer Review</label>
            <textarea required rows={4} placeholder="Paste the customer's review here..." className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.review} onChange={(e) => setFormData({...formData, review: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Customer Name (Optional)</label>
              <input type="text" placeholder="e.g. John Doe" className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Tone</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.tone} onChange={(e) => setFormData({...formData, tone: e.target.value})}>
                {["Professional", "Friendly", "Apologetic", "Warm", "Premium", "Formal"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Language</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}>
                {["English", "Hindi", "Hinglish"].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Reply Length</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.length} onChange={(e) => setFormData({...formData, length: e.target.value})}>
                {["Short", "Medium", "Detailed"].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-col justify-center pt-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="h-5 w-5 accent-amber-600" checked={formData.includeBusinessName} onChange={(e) => setFormData({...formData, includeBusinessName: e.target.checked})} />
                <span className="text-sm font-bold text-zinc-700">Include Business Name in Reply</span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-zinc-700">Additional Context (Optional)</label>
            <input type="text" placeholder="e.g. We had a system outage that day" className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.additionalContext} onChange={(e) => setFormData({...formData, additionalContext: e.target.value})} />
          </div>

          <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 p-4 font-bold text-white hover:bg-amber-700 disabled:opacity-50">
            {loading ? <LoaderCircle className="animate-spin" /> : <Star />} Generate Reply
          </button>
        </form>

        {result && (
          <div className="mt-8 space-y-6">
            {result.reply && (
              <div className="rounded-2xl bg-zinc-50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-zinc-800">Public Reply</h3>
                  <button onClick={() => handleCopy(result.reply)} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-600 shadow-sm">
                    {copied === result.reply ? <Check size={16} /> : <Clipboard size={16} />} {copied === result.reply ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 font-sans">{result.reply}</pre>
              </div>
            )}
            
            {result.alternativeReply && (
              <div className="rounded-2xl bg-zinc-50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-zinc-800">Alternative Public Reply</h3>
                  <button onClick={() => handleCopy(result.alternativeReply)} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-600 shadow-sm">
                    {copied === result.alternativeReply ? <Check size={16} /> : <Clipboard size={16} />} {copied === result.alternativeReply ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 font-sans">{result.alternativeReply}</pre>
              </div>
            )}
            
            {result.privateFollowUp && (
              <div className="rounded-2xl bg-amber-50/50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-amber-800">Private Follow-up (Internal)</h3>
                  <button onClick={() => handleCopy(result.privateFollowUp)} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-600 shadow-sm">
                    {copied === result.privateFollowUp ? <Check size={16} /> : <Clipboard size={16} />} {copied === result.privateFollowUp ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-amber-700 font-sans">{result.privateFollowUp}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
