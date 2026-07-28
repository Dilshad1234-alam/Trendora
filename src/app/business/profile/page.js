"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Mail, Phone, Clock, Store, LoaderCircle, CheckCircle2, AlertCircle } from "lucide-react";

export default function BusinessProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    city: "",
    services: "", // We'll store as string in state, split by comma for array later
    targetCustomers: "",
    goal: "",
    onlinePresence: "",
    workingHours: "",
    contactEmail: "",
    contactPhone: "",
    googleBusinessInfo: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/business/profile");
      const data = await res.json();
      
      if (res.ok && data.success) {
        setFormData({
          businessName: data.data.businessName || "",
          businessType: data.data.businessType || "",
          city: data.data.city || "",
          services: Array.isArray(data.data.services) ? data.data.services.join(", ") : (data.data.services || ""),
          targetCustomers: data.data.targetCustomers || "",
          goal: data.data.goal || "",
          onlinePresence: data.data.onlinePresence || "",
          workingHours: data.data.workingHours || "",
          contactEmail: data.data.contactEmail || "",
          contactPhone: data.data.contactPhone || "",
          googleBusinessInfo: data.data.googleBusinessInfo || "",
        });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to load profile." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        ...formData,
        services: formData.services.split(",").map(s => s.trim()).filter(Boolean),
      };

      const res = await fetch("/api/business/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update profile." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <LoaderCircle className="animate-spin text-violet-600" size={32} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-16">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link href="/business/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-4 transition">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-xl shadow-violet-200">
              <Building2 size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                Business Profile
              </h1>
              <p className="mt-1 text-zinc-600">
                Manage your business details to receive better AI recommendations.
              </p>
            </div>
          </div>
        </header>

        {message.text && (
          <div className={`mb-6 rounded-2xl p-4 flex items-center gap-3 border ${message.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
            {message.type === "error" ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-100 bg-zinc-50/50 p-6">
              <h2 className="text-lg font-bold text-zinc-900">General Information</h2>
              <p className="text-sm text-zinc-500 mt-1">Basic details about your business.</p>
            </div>
            <div className="p-6 grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Business Name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                    <Store size={18} />
                  </div>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-zinc-300 pl-11 pr-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Business Type / Industry</label>
                <input
                  type="text"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">City / Location</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-zinc-300 pl-11 pr-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Services (Comma separated)</label>
                <input
                  type="text"
                  name="services"
                  value={formData.services}
                  onChange={handleChange}
                  placeholder="e.g. Haircuts, Coloring, Styling"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-100 bg-zinc-50/50 p-6">
              <h2 className="text-lg font-bold text-zinc-900">Contact & Operations</h2>
              <p className="text-sm text-zinc-500 mt-1">How customers can reach you and when you&apos;re open.</p>
            </div>
            <div className="p-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 pl-11 pr-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Phone Number</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 pl-11 pr-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Working Hours</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                    <Clock size={18} />
                  </div>
                  <input
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    placeholder="e.g. Mon-Fri 9:00 AM - 6:00 PM"
                    className="w-full rounded-xl border border-zinc-300 pl-11 pr-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Google Business Profile / Maps Link</label>
                <input
                  type="url"
                  name="googleBusinessInfo"
                  value={formData.googleBusinessInfo}
                  onChange={handleChange}
                  placeholder="https://g.page/r/..."
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-100 bg-zinc-50/50 p-6">
              <h2 className="text-lg font-bold text-zinc-900">AI Context</h2>
              <p className="text-sm text-zinc-500 mt-1">Helps Trendora generate better content for you.</p>
            </div>
            <div className="p-6 grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Target Customers</label>
                <textarea
                  name="targetCustomers"
                  value={formData.targetCustomers}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Primary Goal</label>
                <textarea
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-800 transition disabled:opacity-50"
            >
              {saving ? <LoaderCircle className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
