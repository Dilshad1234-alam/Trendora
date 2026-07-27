"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Crown, LoaderCircle, CheckCircle2 } from "lucide-react";
import { getAgencyBranding, updateAgencyBranding } from "@/services/agency-tools.api";

export default function AgencyBrandingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    brandName: "",
    logoUrl: "",
    primaryColor: "#6d28d9",
    customDomain: "",
  });

  const fetchBranding = async () => {
    try {
      setLoading(true);
      const res = await getAgencyBranding();
      if (res.data) {
        setFormData({
          brandName: res.data.brandName || "",
          logoUrl: res.data.logoUrl || "",
          primaryColor: res.data.primaryColor || "#6d28d9",
          customDomain: res.data.customDomain || "",
        });
      }
    } catch (err) {
      setError(err.message || "Failed to load branding");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchBranding();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await updateAgencyBranding(formData);
      setSuccess("Branding settings saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle size={24} className="animate-spin" />
          <span className="font-medium">Loading settings...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[800px] max-w-full -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link href="/agency/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Crown size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-950">
                White Label Branding
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                Customize the platform to match your agency&apos;s identity.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Brand Name</label>
                <input name="brandName" value={formData.brandName} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. Acme Marketing" />
                <p className="mt-2 text-xs text-zinc-500">This will replace the Trendora logo text.</p>
              </div>
              
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Custom Domain</label>
                <input name="customDomain" value={formData.customDomain} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. app.youragency.com" />
                <p className="mt-2 text-xs text-zinc-500">Map your own domain to the platform.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Logo URL</label>
                <div className="flex gap-4 items-center">
                  <input name="logoUrl" value={formData.logoUrl} onChange={handleInputChange} className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="https://example.com/logo.png" />
                  {formData.logoUrl && (
                    <div className="h-12 w-12 rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50 flex items-center justify-center">
                      <img src={formData.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Primary Color</label>
                <div className="flex items-center gap-4">
                  <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleInputChange} className="h-12 w-20 rounded-xl cursor-pointer" />
                  <input type="text" name="primaryColor" value={formData.primaryColor} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 font-mono text-sm" />
                </div>
                <p className="mt-2 text-xs text-zinc-500">Select the accent color for buttons and highlights.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 flex justify-end">
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-8 py-3 font-semibold text-white hover:bg-violet-800 transition disabled:opacity-50 shadow-lg shadow-violet-200">
                {saving ? <LoaderCircle size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
