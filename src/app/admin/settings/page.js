"use client";

import { useEffect, useState } from "react";
import { Save, AlertCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "Trendora",
    supportEmail: "support@trendora.com",
    maxFreeTrialDays: "7",
    enableRegistrations: "true",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const json = await res.json();
        if (json.success && Object.keys(json.data).length > 0) {
          setSettings(prev => ({ ...prev, ...json.data }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: json.message || "Failed to save settings." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-zinc-200/50 rounded-2xl w-full max-w-3xl"></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">System Settings</h1>
        <p className="text-zinc-500 mt-1">Configure global platform variables and features.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* General Settings */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <h3 className="font-bold text-zinc-900">General Information</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Platform Name</label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-zinc-900 focus:border-violet-500 focus:ring-violet-500 shadow-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Support Email</label>
                <input
                  type="email"
                  name="supportEmail"
                  value={settings.supportEmail}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-zinc-900 focus:border-violet-500 focus:ring-violet-500 shadow-sm transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Access Settings */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <h3 className="font-bold text-zinc-900">Registration & Access</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Free Trial Duration (Days)</label>
                <input
                  type="number"
                  name="maxFreeTrialDays"
                  value={settings.maxFreeTrialDays}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-zinc-900 focus:border-violet-500 focus:ring-violet-500 shadow-sm transition-colors"
                />
                <p className="mt-1.5 text-xs text-zinc-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Changes apply only to new registrations.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Enable New Registrations</label>
                <select
                  name="enableRegistrations"
                  value={settings.enableRegistrations}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-zinc-900 focus:border-violet-500 focus:ring-violet-500 shadow-sm transition-colors"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50 transition-colors"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          
          {message && (
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
