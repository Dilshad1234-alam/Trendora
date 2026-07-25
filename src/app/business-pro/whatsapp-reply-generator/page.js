"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, MessageSquareText, Clipboard, Check } from "lucide-react";
import { generateBusinessProWhatsappReply } from "@/services/business-pro.api";

export default function BusinessProWhatsappReplyGenerator() {
  const [formData, setFormData] = useState({
    customerMessage: "",
    tone: "Professional",
    language: "Hinglish",
    length: "Medium",
    includeCta: true,
    cta: "",
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
      const res = await generateBusinessProWhatsappReply(formData);
      setResult(res.data.generatedReply);
    } catch (err) {
      setError(err.message || "Failed to generate WhatsApp reply.");
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
        <h1 className="mb-2 text-3xl font-black text-zinc-900">Pro WhatsApp Responder</h1>
        <p className="mb-8 text-zinc-500">Draft professional and helpful customer replies instantly.</p>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-bold text-zinc-700">Customer Message</label>
            <textarea required rows={4} placeholder="Paste the customer's message here..." className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.customerMessage} onChange={(e) => setFormData({...formData, customerMessage: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Tone</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.tone} onChange={(e) => setFormData({...formData, tone: e.target.value})}>
                {["Professional", "Friendly", "Apologetic", "Warm", "Sales-focused"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Language</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}>
                {["English", "Hindi", "Hinglish"].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Length</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.length} onChange={(e) => setFormData({...formData, length: e.target.value})}>
                {["Short", "Medium", "Detailed"].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Custom CTA (Optional)</label>
              <input type="text" placeholder="e.g. Call us at 1234567890" className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.cta} onChange={(e) => setFormData({...formData, cta: e.target.value})} disabled={!formData.includeCta} />
            </div>
            <div className="flex flex-col justify-center">
              <label className="mb-1 block text-sm font-bold text-zinc-700 invisible">Options</label>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="h-5 w-5 accent-amber-600" checked={formData.includeCta} onChange={(e) => setFormData({...formData, includeCta: e.target.checked})} />
                <span className="text-sm font-bold text-zinc-700">Include Call to Action</span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-zinc-700">Additional Context (Optional)</label>
            <input type="text" placeholder="e.g. Order is delayed by 2 days, offer a 5% discount" className="w-full rounded-xl border p-3 outline-none focus:border-amber-500" value={formData.additionalContext} onChange={(e) => setFormData({...formData, additionalContext: e.target.value})} />
          </div>

          <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 p-4 font-bold text-white hover:bg-amber-700 disabled:opacity-50">
            {loading ? <LoaderCircle className="animate-spin" /> : <MessageSquareText />} Generate Reply
          </button>
        </form>

        {result && (
          <div className="mt-8 space-y-6">
            {result.reply && (
              <div className="rounded-2xl bg-zinc-50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-zinc-800">Main Reply</h3>
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
                  <h3 className="font-bold text-zinc-800">Alternative Reply</h3>
                  <button onClick={() => handleCopy(result.alternativeReply)} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-600 shadow-sm">
                    {copied === result.alternativeReply ? <Check size={16} /> : <Clipboard size={16} />} {copied === result.alternativeReply ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 font-sans">{result.alternativeReply}</pre>
              </div>
            )}
            
            {result.followUpMessage && (
              <div className="rounded-2xl bg-zinc-50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-zinc-800">Follow-up Message (Send later)</h3>
                  <button onClick={() => handleCopy(result.followUpMessage)} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-600 shadow-sm">
                    {copied === result.followUpMessage ? <Check size={16} /> : <Clipboard size={16} />} {copied === result.followUpMessage ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 font-sans">{result.followUpMessage}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
