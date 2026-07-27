"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth.api";
import { 
  Building2, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  LoaderCircle,
  AlertCircle
} from "lucide-react";

export default function AgencySetupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    agencyName: "",
    logoUrl: "",
    website: "",
    businessEmail: "",
    phone: "",
    city: "",
    country: "",
    description: "",
    primaryColor: "#7c3aed",
    secondaryColor: "#c4b5fd",
    
    // Team
    teamMemberName: "",
    teamMemberEmail: "",
    
    // Client
    clientName: "",
    clientEmail: "",
    clientType: "business"
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const res = await getCurrentUser();
        const user = res?.user || res?.data?.user;

        if (!user) {
          router.replace("/login");
          return;
        }

        if (user.plan !== "agency") {
          router.replace("/onboarding/select-plan");
          return;
        }

        if (user.agencyOnboardingCompleted) {
          router.replace("/agency/dashboard");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    setMessage("");
    if (step === 1) {
      if (!formData.agencyName.trim()) {
        setMessage("Agency Name is required to continue.");
        return;
      }
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => {
    setMessage("");
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setMessage("");

      const response = await fetch("/api/agency/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(4); // Completion screen
        setTimeout(() => {
          router.replace(data.nextRoute || "/agency/dashboard");
          router.refresh();
        }, 2000);
      } else {
        setMessage(data.message || "Something went wrong.");
        setSubmitting(false);
      }
    } catch (error) {
      setMessage("Failed to submit agency setup. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <LoaderCircle className="h-10 w-10 animate-spin text-violet-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-zinc-900">
            Welcome to Trendora Agency
          </h1>
          <p className="mt-2 text-zinc-600">
            Let&apos;s set up your agency workspace in just a few steps.
          </p>
        </div>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-200 rounded-full z-0"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-violet-600 rounded-full z-0 transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
              
              {[
                { num: 1, icon: Building2, label: "Agency Info" },
                { num: 2, icon: Users, label: "Team" },
                { num: 3, icon: Briefcase, label: "First Client" }
              ].map((item) => (
                <div key={item.num} className="relative z-10 flex flex-col items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                    step >= item.num 
                      ? "border-violet-600 bg-violet-600 text-white" 
                      : "border-zinc-300 bg-white text-zinc-400"
                  }`}>
                    <item.icon size={18} />
                  </div>
                  <span className={`mt-2 text-xs font-semibold ${
                    step >= item.num ? "text-violet-700" : "text-zinc-500"
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          
          {/* Step 1: Agency Info */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">1. Agency Details</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">
                    Agency Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="agencyName"
                    value={formData.agencyName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="e.g. Apex Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Business Email</label>
                  <input
                    type="email"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="hello@agency.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="https://agency.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">City / Country</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-1/2 rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-1/2 rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Short Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 resize-none"
                    placeholder="Briefly describe your agency..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team */}
          {step === 2 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-2">2. Invite a Team Member</h2>
              <p className="text-sm text-zinc-500 mb-6">
                You can invite a colleague now to collaborate, or skip this step and do it later.
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="teamMemberName"
                    value={formData.teamMemberName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="teamMemberEmail"
                    value={formData.teamMemberEmail}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="john@agency.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: First Client */}
          {step === 3 && (
            <div className="p-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-2">3. Add Your First Client</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Set up a client profile so you can start generating content for them immediately. (Optional)
              </p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="Acme Corp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Client Email</label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                    placeholder="contact@acmecorp.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Client Type</label>
                  <select
                    name="clientType"
                    value={formData.clientType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 bg-white"
                  >
                    <option value="business">Business / Brand</option>
                    <option value="creator">Creator / Influencer</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Completion */}
          {step === 4 && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
              <h2 className="text-2xl font-black text-zinc-900 mb-2">Setup Complete!</h2>
              <p className="text-zinc-600 mb-6">
                Your agency workspace is ready. Taking you to the dashboard...
              </p>
              <LoaderCircle className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          )}

          {/* Error Message */}
          {message && step < 4 && (
            <div className="mx-8 mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600 border border-red-100">
              <AlertCircle size={18} />
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          {/* Footer Actions */}
          {step < 4 && (
            <div className="bg-zinc-50 p-6 flex items-center justify-between border-t border-zinc-200">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:text-violet-600 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <div /> // Placeholder for layout
              )}

              <div className="flex items-center gap-3">
                {step > 1 && step < 4 && (
                  <button
                    type="button"
                    onClick={step === 3 ? handleSubmit : nextStep}
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={step === 3 ? handleSubmit : nextStep}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><LoaderCircle size={16} className="animate-spin" /> Saving...</>
                  ) : (
                    <>{step === 3 ? "Complete Setup" : "Continue"} <ChevronRight size={16} /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
