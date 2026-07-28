"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Building2,
  LogOut,
} from "lucide-react";

import { getCurrentUser, logoutUser } from "@/services/auth.api";

const TOTAL_STEPS = 3;

const TEAM_SIZE_OPTIONS = [
  { value: "1", label: "Just Me (1)" },
  { value: "2-5", label: "2 - 5 members" },
  { value: "6-15", label: "6 - 15 members" },
  { value: "16+", label: "16+ members" },
];

export default function AgencyOnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    agencyName: "",
    logoUrl: "",
    teamSize: "",
    country: "",
    timezone: "",
    firstClient: "",
    primaryColor: "#7c3aed",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  const inputClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";
  const labelClass = "mb-2 block text-sm font-semibold text-zinc-700";

  const clearMessage = () => setMessage({ type: "", text: "" });
  const showError = (text) => setMessage({ type: "error", text });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearMessage();
  };

  const selectOption = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    clearMessage();
  };

  const validateCurrentStep = () => {
    if (step === 1 && !formData.agencyName.trim()) {
      showError("Please enter your agency name.");
      return false;
    }
    if (step === 2 && (!formData.teamSize || !formData.country.trim() || !formData.timezone.trim())) {
      showError("Please fill out all required fields.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    clearMessage();
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    clearMessage();
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);
      clearMessage();

      const response = await fetch("/api/onboarding/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Onboarding failed.");
      }

      const nextRoute = data?.data?.nextRoute || "/agency/dashboard";
      router.replace(nextRoute);
      router.refresh();
    } catch (error) {
      showError(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const renderOptionCard = ({ fieldName, value, label }) => {
    const isSelected = formData[fieldName] === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => selectOption(fieldName, value)}
        className={`flex min-h-16 items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
          isSelected
            ? "border-violet-600 bg-violet-50 text-violet-700 ring-2 ring-violet-100"
            : "border-zinc-200 bg-white text-zinc-800 hover:border-violet-300 hover:bg-violet-50/40"
        }`}
      >
        <span className="font-semibold">{label}</span>
        {isSelected && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white">
            <Check size={13} />
          </span>
        )}
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/Trendora_Landing_Logo.png"
              alt="Trendora Logo"
              width={270}
              height={104}
              priority
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5">
              <Building2 size={14} className="text-violet-700" />
              <span className="text-xs font-semibold text-violet-700">Agency Onboarding</span>
            </div>

            {user?.fullname && (
              <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50/50 py-1.5 pl-1.5 pr-4 transition hover:bg-zinc-50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                  {user.fullname.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm font-medium text-zinc-700 sm:block">
                  {user.fullname}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </nav>
      </header>

      <section className="relative min-h-[calc(100vh-89px)] overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
        <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-violet-100/70">
            <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white">
                  <Building2 size={22} />
                </div>
                <div>
                  <h1 className="font-bold text-zinc-900">Agency Workspace Setup</h1>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                    Configure your agency settings to manage clients.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-500">
                    {step === 0 ? "Getting Started" : `Step ${step} of ${TOTAL_STEPS}`}
                  </p>
                  <p className="text-sm font-semibold text-violet-700">{progress}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-100">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {step === 0 && (
                <div className="py-6 text-center sm:py-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <Sparkles size={30} />
                  </div>
                  <h2 className="mt-6 text-3xl font-black text-zinc-950">
                    Welcome to Agency Management
                  </h2>
                  <p className="mx-auto mt-3 max-w-lg leading-7 text-zinc-500">
                    Set up your agency profile. Manage multiple client workspaces, switch between clients instantly, and generate high-quality AI content for any brand.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-8 py-3.5 font-semibold text-white transition hover:bg-violet-800"
                  >
                    Get Started
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-zinc-950">Agency Branding</h2>
                  <p className="mt-2 mb-8 leading-7 text-zinc-500">
                    Enter your agency name and an optional logo URL.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="agencyName" className={labelClass}>
                        Agency Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="agencyName"
                        name="agencyName"
                        type="text"
                        value={formData.agencyName}
                        onChange={handleChange}
                        placeholder="e.g. Acme Marketing"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="logoUrl" className={labelClass}>
                        Logo URL (Optional)
                      </label>
                      <input
                        id="logoUrl"
                        name="logoUrl"
                        type="text"
                        value={formData.logoUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/logo.png"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-zinc-950">Agency Details</h2>
                  <p className="mt-2 mb-8 leading-7 text-zinc-500">
                    Tell us a bit more about your operations.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>
                        Team Size <span className="text-red-500">*</span>
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {TEAM_SIZE_OPTIONS.map((opt) =>
                          renderOptionCard({
                            fieldName: "teamSize",
                            value: opt.value,
                            label: opt.label,
                          })
                        )}
                      </div>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="country" className={labelClass}>
                          Country <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="country"
                          name="country"
                          type="text"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="e.g. India"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="timezone" className={labelClass}>
                          Timezone <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="timezone"
                          name="timezone"
                          type="text"
                          value={formData.timezone}
                          onChange={handleChange}
                          placeholder="e.g. IST"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-zinc-950">First Client (Optional)</h2>
                  <p className="mt-2 mb-8 leading-7 text-zinc-500">
                    You can set up your first client now, or skip this and do it later.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="firstClient" className={labelClass}>
                        Client Brand Name
                      </label>
                      <input
                        id="firstClient"
                        name="firstClient"
                        type="text"
                        value={formData.firstClient}
                        onChange={handleChange}
                        placeholder="e.g. TechCorp"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="primaryColor" className={labelClass}>
                        Your Agency Brand Color (Hex)
                      </label>
                      <input
                        id="primaryColor"
                        name="primaryColor"
                        type="text"
                        value={formData.primaryColor}
                        onChange={handleChange}
                        placeholder="#7c3aed"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {message.text && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">!</span>
                  <p>{message.text}</p>
                </div>
              )}

              {step > 0 && (
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3.5 font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                  {step < TOTAL_STEPS ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-semibold text-white transition hover:bg-violet-800"
                    >
                      Continue <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <><LoaderCircle size={18} className="animate-spin" /> Completing...</>
                      ) : (
                        <>Complete Setup <ArrowRight size={18} /></>
                      )}
                    </button>
                  )}
                </div>
              )}

              <div className="mt-6 flex items-start gap-3 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-500">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-violet-600" />
                <p>
                  <strong>Disclaimer:</strong> Trendora provides AI tools for your agency, but does NOT provide clients. You are responsible for bringing and managing your own clients on the platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
