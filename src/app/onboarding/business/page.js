"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, LoaderCircle, Sparkles } from "lucide-react";
import { completeBusinessOnboarding } from "@/services/onboarding.api";

export default function BusinessOnboardingPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    city: "",
    services: "",
    targetCustomers: "",
    goal: "",
    onlinePresence: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const {
      businessName,
      businessType,
      city,
      services,
      goal,
    } = formData;

    if (
      !businessName.trim() ||
      !businessType ||
      !city.trim() ||
      !services.trim() ||
      !goal
    ) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields.",
      });

      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        businessName: formData.businessName.trim(),
        city: formData.city.trim(),
        targetCustomers: formData.targetCustomers.trim(),
        onlinePresence: formData.onlinePresence.trim(),
        services: formData.services
          .split(",")
          .map((service) => service.trim())
          .filter(Boolean),
      };

      const data = await completeBusinessOnboarding(payload);

      router.replace(data.nextRoute || "/business/dashboard");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Business onboarding failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[35%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Background Dots Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl shadow-2xl shadow-violet-950/20">
        
        {/* Header Section */}
        <div className="px-6 py-10 sm:px-12 text-center border-b border-white/5">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Sparkles size={26} className="animate-pulse" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Business Onboarding
          </p>

          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Tell us about your <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">business</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Trendora will use this information to generate local SEO keywords,
            social media posts, review replies and weekly growth suggestions.
          </p>
        </div>

        {/* Profile Card Info Box */}
        <div className="border-b border-white/5 bg-white/[0.02] px-6 py-6 sm:px-12">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <Building2 size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Business Profile
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                Required fields complete karein. Optional information baad me
                settings se update ki ja sakti hai.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-12">
          {message.text && (
            <div
              className={`mb-6 rounded-xl border p-4 text-sm flex items-start gap-3 backdrop-blur-md transition-all duration-300 ${
                message.type === "success"
                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "border-red-500/25 bg-red-500/10 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
              }`}
            >
              <div className={`p-1 rounded-md shrink-0 ${
                message.type === "success" ? "bg-emerald-500/20" : "bg-red-500/20"
              }`}>
                {message.type === "success" ? (
                  <Sparkles size={16} className="text-emerald-400" />
                ) : (
                  <span className="text-red-400 font-bold block leading-none w-4 h-4 text-center">!</span>
                )}
              </div>
              <div>{message.text}</div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid gap-6 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label
                htmlFor="businessName"
                className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Business name <span className="text-red-400 ml-0.5">*</span>
              </label>

              <input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Example: Patna Digital Studio"
                autoComplete="organization"
                className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="businessType"
                className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Business type <span className="text-red-400 ml-0.5">*</span>
              </label>

              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 [&>option]:bg-[#0c0827] [&>option]:text-white"
              >
                <option value="">Select business type</option>
                <option value="coaching-institute">
                  Coaching Institute
                </option>
                <option value="clinic">Clinic</option>
                <option value="restaurant">Restaurant</option>
                <option value="hotel">Hotel</option>
                <option value="salon">Salon</option>
                <option value="interior-designer">
                  Interior Designer
                </option>
                <option value="real-estate">Real Estate</option>
                <option value="digital-marketing-agency">
                  Digital Marketing Agency
                </option>
                <option value="retail-store">Retail Store</option>
                <option value="local-service-provider">
                  Local Service Provider
                </option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                City <span className="text-red-400 ml-0.5">*</span>
              </label>

              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                placeholder="Example: Patna"
                autoComplete="address-level2"
                className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="services"
                className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Services <span className="text-red-400 ml-0.5">*</span>
              </label>

              <input
                id="services"
                name="services"
                type="text"
                value={formData.services}
                onChange={handleChange}
                placeholder="Example: Web Development, SEO, Social Media Marketing"
                className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
              />

              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                Multiple services ko comma se separate karein.
              </p>
            </div>

            <div>
              <label
                htmlFor="targetCustomers"
                className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Target customers
              </label>

              <input
                id="targetCustomers"
                name="targetCustomers"
                type="text"
                value={formData.targetCustomers}
                onChange={handleChange}
                placeholder="Example: Students, local families, startups"
                className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="goal"
                className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Primary goal <span className="text-red-400 ml-0.5">*</span>
              </label>

              <select
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 [&>option]:bg-[#0c0827] [&>option]:text-white"
              >
                <option value="">Select primary goal</option>
                <option value="more-calls">Get more calls</option>
                <option value="more-messages">Get more messages</option>
                <option value="more-visits">Increase store visits</option>
                <option value="local-seo">
                  Improve local Google ranking
                </option>
                <option value="brand-awareness">
                  Increase brand awareness
                </option>
                <option value="generate-leads">Generate leads</option>
                <option value="increase-sales">Increase sales</option>
                <option value="manage-reviews">
                  Improve review management
                </option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="onlinePresence"
                className="mb-2 block text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Current online presence
              </label>

              <textarea
                id="onlinePresence"
                name="onlinePresence"
                value={formData.onlinePresence}
                onChange={handleChange}
                rows={4}
                placeholder="Example: We have an Instagram page and Google Business Profile, but we do not post regularly."
                className="w-full resize-none rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
              />
            </div>

            <div className="sm:col-span-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-4 font-semibold text-white transition hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] transition-all duration-300 overflow-hidden"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Saving business profile...
                  </>
                ) : (
                  <>
                    Complete onboarding
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Text */}
        <div className="pb-8 text-center">
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Aapki information personalized growth suggestions ke liye use hogi.
          </p>
        </div>
      </div>
    </main>
  );
}