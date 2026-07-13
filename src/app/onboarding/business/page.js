"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, LoaderCircle, Sparkles,} from "lucide-react";
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
    <main className="min-h-screen bg-[#f7f7fb] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-200">
            <Sparkles size={27} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            Business Onboarding
          </p>

          <h1 className="mt-2 text-3xl font-bold text-zinc-900 sm:text-4xl">
            Tell us about your business
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
            Trendora will use this information to generate local SEO keywords,
            social media posts, review replies and weekly growth suggestions.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50">
          <div className="border-b border-zinc-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-6 py-6 sm:px-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white">
                <Building2 size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Business profile
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Required fields complete karein. Optional information baad me
                  settings se update ki ja sakti hai.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {message.text && (
              <div
                className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="grid gap-6 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <label
                  htmlFor="businessName"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Business name <span className="text-red-500">*</span>
                </label>

                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Example: Patna Digital Studio"
                  autoComplete="organization"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="businessType"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Business type <span className="text-red-500">*</span>
                </label>

                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  City <span className="text-red-500">*</span>
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Example: Patna"
                  autoComplete="address-level2"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="services"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Services <span className="text-red-500">*</span>
                </label>

                <input
                  id="services"
                  name="services"
                  type="text"
                  value={formData.services}
                  onChange={handleChange}
                  placeholder="Example: Web Development, SEO, Social Media Marketing"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />

                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  Multiple services ko comma se separate karein.
                </p>
              </div>

              <div>
                <label
                  htmlFor="targetCustomers"
                  className="mb-2 block text-sm font-medium text-zinc-700"
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
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="goal"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Primary goal <span className="text-red-500">*</span>
                </label>

                <select
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                  className="mb-2 block text-sm font-medium text-zinc-700"
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
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3.5 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />
                      Saving business profile...
                    </>
                  ) : (
                    <>
                      Complete onboarding
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-zinc-400">
          Aapki information personalized growth suggestions ke liye use hogi.
        </p>
      </div>
    </main>
  );
}