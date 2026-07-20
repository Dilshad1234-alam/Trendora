"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import {
  ArrowRight,
  Bot,
  Check,
  Crown,
  LoaderCircle,
  Sparkles,
  Zap,
} from "lucide-react";

import {
  getCurrentUser,
  selectPlan,
} from "@/services/auth.api";

export default function SelectPlanPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const getDashboardRoute = (currentUser) => {
    if (!currentUser) {
      return "/login";
    }

    const role = currentUser.role;
    const plan = currentUser.plan || "free";

    if (plan === "agent") {
      return "/agent/dashboard";
    }

    if (role === "creator") {
      if (plan === "creator-pro") {
        return "/creator-pro/dashboard";
      }

      return "/creator/dashboard";
    }

    if (role === "business") {
      if (plan === "business-pro") {
        return "/business-pro/dashboard";
      }

      return "/business/dashboard";
    }

    return "/onboarding/select-role";
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setMessage("");

        const data = await getCurrentUser();

        const currentUser =
          data?.user ||
          data?.data?.user ||
          null;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (!currentUser.role) {
          router.replace("/onboarding/select-role");
          return;
        }

        if (!currentUser.onboardingCompleted) {
          router.replace(
            currentUser.role === "creator"
              ? "/onboarding/creator"
              : "/onboarding/business"
          );
          return;
        }

        if (currentUser.planSelected) {
          const dashboardRoute = getDashboardRoute(currentUser);

          router.replace(dashboardRoute);
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error("Load user error:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const isCreator = user?.role === "creator";

  const plans = useMemo(() => {
    if (!user) {
      return [];
    }

    const freeFeatures = isCreator
      ? [
          "Creator dashboard access",
          "Daily AI content plan",
          "Hook generator",
          "Script generator",
          "Caption generator",
          "Hashtag generator",
          "Saved content library",
          "Basic AI usage limits",
        ]
      : [
          "Business dashboard access",
          "Product description generator",
          "Review reply generator",
          "WhatsApp reply generator",
          "Local SEO generator",
          "Ad copy generator",
          "Saved content library",
          "Basic AI usage limits",
        ];

    const proFeatures = isCreator
      ? [
          "Everything included in Free",
          "Creator Pro dashboard",
          "Higher AI generation limits",
          "Advanced content planner",
          "Trend analyzer",
          "Viral content scoring",
          "Premium AI templates",
          "Priority feature access",
        ]
      : [
          "Everything included in Free",
          "Business Pro dashboard",
          "Higher AI generation limits",
          "Business analytics",
          "Advanced local SEO tools",
          "Competitor content analysis",
          "Premium business templates",
          "Priority feature access",
        ];

    const agentFeatures = [
      "Everything included in Pro",
      "Agent dashboard access",
      "Creator and business tools",
      "Unlimited premium workspace",
      "Advanced AI agents",
      "Automation features",
      "Premium analytics",
      "Priority support",
    ];

    return [
      {
        id: "free",
        name: "Free",
        price: "₹0",
        period: "Forever",
        description: isCreator
          ? "Start creating content using Trendora's essential AI tools."
          : "Start growing your business using essential AI tools.",
        features: freeFeatures,
        icon: Sparkles,
        badge: "Start free",
        popular: false,
      },
      {
        id: isCreator ? "creator-pro" : "business-pro",
        name: isCreator ? "Creator Pro" : "Business Pro",
        price: isCreator ? "₹299" : "₹599",
        period: "per month",
        description: isCreator
          ? "For creators who want advanced AI tools and higher usage limits."
          : "For businesses that need advanced growth and marketing tools.",
        features: proFeatures,
        icon: Crown,
        badge: "Most popular",
        popular: true,
      },
      {
        id: "agent",
        name: "Agent",
        price: "₹2,999",
        period: "per month",
        description:
          "Get access to advanced AI agents, automation and every Trendora tool.",
        features: agentFeatures,
        icon: Bot,
        badge: "Ultimate",
        popular: false,
      },
    ]
  }, [user, isCreator]);
  
  const handleContinue = async () => {
    if (!selectedPlan) {
      setMessage("Please select a plan.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response = await selectPlan(selectedPlan);

      if (response?.success) {
        const nextRoute =
          response?.data?.nextRoute ||
          getDashboardRoute({
            ...user,
            plan: selectedPlan,
          });

        router.replace(nextRoute);
        router.refresh();
        return;
      }

      setMessage(response?.message || "Unable to activate plan.");
    } catch (error) {
      setMessage(error?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <LoaderCircle className="animate-spin text-violet-600" size={40} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white">
      {/* Header */}

      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Image
              src="/Trendora_Landing_Logo.png"
              alt="Trendora"
              width={240}
              height={70}
            />
          </Link>

          <div className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
            Choose your plan
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="text-center">

          <p className="text-violet-700 font-bold uppercase tracking-widest">
            Trendora Pricing
          </p>

          <h1 className="mt-4 text-5xl font-black">

            {isCreator
              ? "Choose your Creator plan"
              : "Choose your Business plan"}

          </h1>

          <p className="mt-4 text-zinc-600">

            Select a plan to continue to your dashboard.

          </p>

        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-3xl border p-8 text-left transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? "border-violet-600 bg-violet-50 shadow-xl"
                    : "border-zinc-200 bg-white hover:border-violet-300 hover:-translate-y-1"
                }`}
              >
                {plan.popular && (
                  <span className="absolute right-5 top-5 rounded-full bg-violet-700 px-3 py-1 text-xs font-bold text-white">
                    Most Popular
                  </span>
                )}

                <Icon
                  className="text-violet-700"
                  size={34}
                />

                <h2 className="mt-6 text-2xl font-bold">
                  {plan.name}
                </h2>

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-5xl font-black">
                    {plan.price}
                  </span>

                  <span className="pb-2 text-zinc-500">
                    {plan.period}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-7 text-zinc-600">
                  {plan.description}
                </p>

                <div className="mt-8 space-y-3">

                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3"
                    >
                      <Check
                        size={16}
                        className="text-green-600"
                      />

                      <span className="text-sm text-zinc-700">
                        {feature}
                      </span>
                    </div>
                  ))}

                </div>

                {selectedPlan === plan.id && (
                  <div className="mt-8 flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-white">
                    <Zap size={18} />
                    Selected Plan
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {message && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {message}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!selectedPlan || submitting}
          className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-violet-700 py-5 text-lg font-bold text-white transition hover:bg-violet-800 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <LoaderCircle
                className="animate-spin"
                size={20}
              />
              Activating...
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </section>
    </main>
  );
}











// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import {
//   ArrowRight,
//   Check,
//   Crown,
//   LoaderCircle,
//   Sparkles,
// } from "lucide-react";

// import {
//   getCurrentUser,
//   selectPlan,
// } from "@/services/auth.api";

// export default function SelectPlanPage() {
//   const router = useRouter();

//   const [user, setUser] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState("");

//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const data = await getCurrentUser();

//         const currentUser = data.user || data.data?.user;

//         if (!currentUser) {
//           router.replace("/login");
//           return;
//         }

//         if (!currentUser.role) {
//           router.replace("/onboarding/select-role");
//           return;
//         }

//         if (!currentUser.onboardingCompleted) {
//           router.replace(
//             currentUser.role === "creator"
//               ? "/onboarding/creator"
//               : "/onboarding/business"
//           );
//           return;
//         }

//         if (currentUser.planSelected) {
//           router.replace(
//             currentUser.role === "creator"
//               ? "/creator/dashboard"
//               : "/business/dashboard"
//           );
//           return;
//         }

//         setUser(currentUser);
//       } catch {
//         router.replace("/login");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUser();
//   }, [router]);

//   const handleContinue = async () => {
//     if (!selectedPlan) {
//       setMessage("Please select a plan.");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       setMessage("");

//       const response = await selectPlan(selectedPlan);

//       console.log("Select plan response:", response);

//       if (response.success && response.data?.nextRoute) {
//         router.replace(response.data.nextRoute);
//         router.refresh();
//         return;
//       }

//       setMessage("Dashboard route not found.");
//     } catch (error) {
//       setMessage(error.message || "Unable to activate plan.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <main className="min-h-screen bg-white flex items-center justify-center">
//         <div className="flex items-center gap-3 text-violet-700">
//           <LoaderCircle size={28} className="animate-spin" />
//           <span className="font-medium text-zinc-600">Loading...</span>
//         </div>
//       </main>
//     );
//   }

//   const isCreator = user?.role === "creator";

//   return (
//     <main className="min-h-screen bg-white text-zinc-900">
//       {/* Navbar */}
//       <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl">
//         <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
//           <Link href="/" className="flex items-center">
//             <Image
//               src="/Trendora_Landing_Logo.png"
//               alt="Trendora Logo"
//               width={270}
//               height={104}
//               priority
//               className="h-14 w-auto object-contain sm:h-16"
//             />
//           </Link>

//           <div className="flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5">
//             <Sparkles size={14} className="text-violet-700" />
//             <span className="text-xs font-semibold text-violet-700">
//               Almost done!
//             </span>
//           </div>
//         </nav>
//       </header>

//       {/* Main Content */}
//       <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
//         <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/25 blur-3xl" />

//         <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
//           {/* Header */}
//           <div className="mb-12 text-center">
//             <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
//               <Sparkles size={26} />
//             </div>

//             <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
//               Onboarding completed
//             </p>

//             <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
//               Choose your{" "}
//               <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
//                 Trendora plan
//               </span>
//             </h1>

//             <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-600">
//               Your {isCreator ? "creator" : "business"} profile is ready.
//               Select a plan to open your dashboard.
//             </p>
//           </div>

//           {/* Plan Cards */}
//           <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
//             {/* Free Plan */}
//             <button
//               type="button"
//               onClick={() => setSelectedPlan("free")}
//               className={`relative rounded-3xl border text-left transition-all duration-200 p-7 cursor-pointer ${
//                 selectedPlan === "free"
//                   ? "border-violet-400 bg-violet-50 shadow-lg shadow-violet-100"
//                   : "border-zinc-200 bg-white shadow-sm hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5"
//               }`}
//             >
//               <div className="flex items-start justify-between gap-4">
//                 <div>
//                   <p className="text-sm font-semibold text-violet-700">
//                     Free Plan
//                   </p>
//                   <h2 className="mt-2 text-3xl font-black text-zinc-950">₹0</h2>
//                   <p className="mt-1 text-sm text-zinc-500">Free forever</p>
//                 </div>

//                 <span
//                   className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
//                     selectedPlan === "free"
//                       ? "border-violet-600 bg-violet-700 text-white"
//                       : "border-zinc-300 bg-white"
//                   }`}
//                 >
//                   {selectedPlan === "free" && <Check size={14} />}
//                 </span>
//               </div>

//               <div className="mt-7 space-y-3">
//                 {[
//                   "Daily AI content plan",
//                   "Hook generator",
//                   "Script generator",
//                   "Caption generator",
//                   "Hashtag generator",
//                   "Thumbnail title generator",
//                   "Video description generator",
//                   "Saved content library",
//                 ].map((feature) => (
//                   <div
//                     key={feature}
//                     className="flex items-center gap-3 text-sm text-zinc-600"
//                   >
//                     <Check size={15} className="shrink-0 text-emerald-600" />
//                     {feature}
//                   </div>
//                 ))}
//               </div>
//             </button>

//             {/* Pro Plan — Coming Soon */}
//             <div className="relative rounded-3xl border border-zinc-200 bg-white p-7 opacity-60">
//               <span className="absolute right-5 top-5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
//                 Coming soon
//               </span>

//               <Crown size={28} className="text-amber-500" />

//               <p className="mt-5 text-sm font-semibold text-amber-600">
//                 {isCreator ? "Creator Pro" : "Business Pro"}
//               </p>

//               <h2 className="mt-2 text-3xl font-black text-zinc-950">
//                 Upgrade later
//               </h2>

//               <p className="mt-4 text-sm leading-7 text-zinc-500">
//                 Unlock higher usage limits, weekly plans,
//                 analytics and advanced AI tools.
//               </p>
//             </div>
//           </div>

//           {/* Error message */}
//           {message && (
//             <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//               {message}
//             </div>
//           )}

//           {/* CTA Button */}
//           <div className="mx-auto mt-8 max-w-4xl">
//             <button
//               type="button"
//               onClick={handleContinue}
//               disabled={submitting || !selectedPlan}
//               className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-4 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               {submitting ? (
//                 <>
//                   <LoaderCircle size={19} className="animate-spin" />
//                   Activating plan...
//                 </>
//               ) : (
//                 <>
//                   {selectedPlan ? "Continue to dashboard" : "Select a plan first"}
//                   <ArrowRight
//                     size={18}
//                     className="group-hover:translate-x-1 transition-transform"
//                   />
//                 </>
//               )}
//             </button>
//           </div>

//           {/* Trust badges */}
//           <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-500">
//             <span className="flex items-center gap-2">
//               <Check size={15} className="text-emerald-600" />
//               No credit card required
//             </span>
//             <span className="flex items-center gap-2">
//               <Check size={15} className="text-emerald-600" />
//               Free forever plan
//             </span>
//             <span className="flex items-center gap-2">
//               <Check size={15} className="text-emerald-600" />
//               Upgrade anytime
//             </span>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }