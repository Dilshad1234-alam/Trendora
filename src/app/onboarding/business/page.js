"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, LoaderCircle, Sparkles, Check } from "lucide-react";
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

    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { businessName, businessType, city, services, goal } = formData;

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

  const inputClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200";

  const selectClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 appearance-none cursor-pointer";

  const labelClass =
    "mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500";

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* Navbar */}
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

          <div className="flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5">
            <Sparkles size={14} className="text-violet-700" />
            <span className="text-xs font-semibold text-violet-700">
              Business Onboarding
            </span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
        <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/25 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Sparkles size={26} />
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Business Onboarding
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
              Tell us about your{" "}
              <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                business
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Trendora will use this information to generate local SEO keywords,
              social media posts, review replies and weekly growth suggestions.
            </p>
          </div>

          {/* Form Card */}
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-violet-100">
            {/* Profile Info Bar */}
            <div className="border-b border-zinc-100 bg-zinc-50 px-8 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-zinc-900">Business Profile</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                    Required fields complete karein. Optional information baad me
                    settings se update ki ja sakti hai.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-8 sm:p-10">
              {/* Message Alert */}
              {message.text && (
                <div
                  className={`mb-6 rounded-xl border p-4 text-sm flex items-start gap-3 ${
                    message.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      message.type === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {message.type === "success" ? (
                      <Check size={13} />
                    ) : (
                      <span className="font-bold text-xs leading-none">!</span>
                    )}
                  </span>
                  <div>{message.text}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="businessName" className={labelClass}>
                    Business name{" "}
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Example: Patna Digital Studio"
                    autoComplete="organization"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className={labelClass}>
                    Business type{" "}
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="">Select business type</option>
                    <option value="coaching-institute">Coaching Institute</option>
                    <option value="clinic">Clinic</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="salon">Salon</option>
                    <option value="interior-designer">Interior Designer</option>
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
                  <label htmlFor="city" className={labelClass}>
                    City <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Example: Patna"
                    autoComplete="address-level2"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="services" className={labelClass}>
                    Services <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    id="services"
                    name="services"
                    type="text"
                    value={formData.services}
                    onChange={handleChange}
                    placeholder="Example: Web Development, SEO, Social Media Marketing"
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    Multiple services ko comma se separate karein.
                  </p>
                </div>

                <div>
                  <label htmlFor="targetCustomers" className={labelClass}>
                    Target customers
                  </label>
                  <input
                    id="targetCustomers"
                    name="targetCustomers"
                    type="text"
                    value={formData.targetCustomers}
                    onChange={handleChange}
                    placeholder="Example: Students, local families, startups"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="goal" className={labelClass}>
                    Primary goal{" "}
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select
                    id="goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="">Select primary goal</option>
                    <option value="more-calls">Get more calls</option>
                    <option value="more-messages">Get more messages</option>
                    <option value="more-visits">Increase store visits</option>
                    <option value="local-seo">Improve local Google ranking</option>
                    <option value="brand-awareness">Increase brand awareness</option>
                    <option value="generate-leads">Generate leads</option>
                    <option value="increase-sales">Increase sales</option>
                    <option value="manage-reviews">Improve review management</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="onlinePresence" className={labelClass}>
                    Current online presence
                  </label>
                  <textarea
                    id="onlinePresence"
                    name="onlinePresence"
                    value={formData.onlinePresence}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Example: We have an Instagram page and Google Business Profile, but we do not post regularly."
                    className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                  />
                </div>

                <div className="sm:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Saving business profile...
                      </>
                    ) : (
                      <>
                        Complete onboarding
                        <ArrowRight
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer note */}
            <div className="border-t border-zinc-100 px-8 py-4 text-center">
              <p className="text-xs leading-relaxed text-zinc-400">
                Aapki information personalized growth suggestions ke liye use hogi.
              </p>
            </div>
          </div>

          {/* Info badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <Check size={15} className="text-emerald-600" />
              Personalized AI results
            </span>
            <span className="flex items-center gap-2">
              <Check size={15} className="text-emerald-600" />
              Updated anytime from settings
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}