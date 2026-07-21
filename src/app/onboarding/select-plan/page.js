"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Bot,
  Check,
  Crown,
  LoaderCircle,
  Sparkles,
  Zap,
  LockKeyhole,
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

    if (plan === "agency") {
      return "/agency/dashboard";
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

    if (role === "admin") {
      return "/admin/dashboard";
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
          router.replace(getDashboardRoute(currentUser));
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
  const trialExpired = Boolean(user?.trialExpired);

  const plans = useMemo(() => {
    if (!user) {
      return [];
    }

    const freeFeatures = isCreator
      ? [
          "Creator dashboard access",
          "Hook generator",
          "Script generator",
          "Caption generator",
          "Hashtag generator",
          "Saved content library",
          "Limited AI Generations",
        ]
      : [
          "Business dashboard access",
          "Product description generator",
          "Review reply generator",
          "WhatsApp reply generator",
          "Local SEO generator",
          "Ad copy generator",
          "Saved content library",
          "Limited AI Generations",
        ];

    const proFeatures = isCreator
      ? [
          "Everything in Free",
          "Unlimited Hook Generator",
          "Unlimited Script Generator",
          "Unlimited Caption Generator",
          "Unlimited Hashtag Generator",
          "Trend Analyzer",
          "Viral Content Score",
          "Weekly Content Planner",
          "Unlimited Saved Content",
          "Priority Support",
        ]
      : [
          "Everything in Free",
          "Unlimited Product Descriptions",
          "Unlimited Review Replies",
          "Unlimited WhatsApp Replies",
          "Unlimited Local SEO",
          "Competitor Analysis",
          "Business Analytics",
          "Monthly Reports",
          "Unlimited Saved Content",
          "Priority Support",
        ];

    const agencyFeatures = [
      "Everything in Creator & Business Pro",
      "Multi-Client Workspace",
      "Team Collaboration",
      "Unlimited AI Generations",
      "White Label Branding",
      "AI Automation",
      "Advanced Analytics",
      "Priority Support",
      "API Access", 
    ];

    return [
      {
        id: "free",
        name: "Free Trial",
        price: "₹0",
        period: "3 days",
        description: trialExpired
          ? "Your 3-day free trial has ended. Select a paid plan to continue."
          : isCreator
          ? "Try Trendora's essential creator tools free for 3 days."
          : "Try Trendora's essential business tools free for 3 days.",
        features: freeFeatures,
        icon: Sparkles,
        popular: false,
        disabled: trialExpired,
      },
      {
        id: isCreator ? "creator-pro" : "business-pro",
        name: isCreator ? "Creator Pro" : "Business Pro",
        price: isCreator ? "₹499" : "₹999",
        period: "per month",
        description: isCreator
          ? "For creators who want advanced AI tools and higher usage limits."
          : "For businesses that need advanced growth and marketing tools.",
        features: proFeatures,
        icon: Crown,
        popular: true,
        disabled: false,
      },
      {
        id: "agency",
        name: "Agency",
        price: "₹2,999",
        period: "per month",
        description:
          "Get advanced AI agents, automation and every Trendora tool.",
        features: agencyFeatures,
        icon: Bot,
        popular: false,
        disabled: false,
      },
    ];
  }, [user, isCreator, trialExpired]);

  const handlePlanSelect = (plan) => {
    if (plan.disabled) {
      setMessage(
        "Your free trial has ended. Please select a paid plan."
      );
      return;
    }

    setMessage("");
    setSelectedPlan(plan.id);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      setMessage("Please select a paid plan.");
      return;
    }

    if (trialExpired && selectedPlan === "free") {
      setMessage(
        "Your free trial has ended. Please select a paid plan."
      );
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response = await selectPlan(selectedPlan);

      if (response?.success) {
        const nextRoute =
          response?.data?.nextRoute ||
          response?.nextRoute ||
          getDashboardRoute({
            ...user,
            plan: selectedPlan,
            planSelected: true,
          });

        router.replace(nextRoute);
        router.refresh();
        return;
      }

      setMessage(
        response?.message ||
          "Unable to activate the selected plan."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Something went wrong while selecting the plan."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <LoaderCircle
          className="animate-spin text-violet-600"
          size={40}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <p className="font-bold uppercase tracking-widest text-violet-700">
            Trendora Pricing
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-5xl">
            {trialExpired
              ? "Your free trial has ended"
              : isCreator
              ? "Choose your Creator plan"
              : "Choose your Business plan"}
          </h1>

          <p className="mt-4 text-zinc-600">
            {trialExpired
              ? "Select a paid plan to continue using Trendora."
              : "Select a plan to continue to your dashboard."}
          </p>
        </div>

        {trialExpired && (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <LockKeyhole size={20} />

              <h2 className="font-bold">
                Your 3-day free trial has ended
              </h2>
            </div>

            <p className="mt-2 text-sm text-blue-700">
              The Free Trial card is shown for reference, but it
              cannot be selected again.
            </p>
          </div>
        )}

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            const isDisabled = plan.disabled;

            return (
              <button
                key={plan.id}
                type="button"
                disabled={isDisabled}
                onClick={() => handlePlanSelect(plan)}
                className={`relative rounded-3xl border p-8 text-left transition-all duration-300 ${
                  isDisabled
                    ? "cursor-not-allowed border-blue-300 bg-blue-50 opacity-85"
                    : isSelected
                    ? "border-violet-600 bg-violet-50 shadow-xl"
                    : "border-zinc-200 bg-white hover:-translate-y-1 hover:border-violet-300"
                }`}
              >
                {plan.popular && (
                  <span className="absolute right-5 top-5 rounded-full bg-violet-700 px-3 py-1 text-xs font-bold text-white">
                    Most Popular
                  </span>
                )}

                {isDisabled && (
                  <span className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                    Trial Ended
                  </span>
                )}

                <Icon
                  className={
                    isDisabled
                      ? "text-blue-600"
                      : "text-violet-700"
                  }
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

                <p
                  className={`mt-5 text-sm leading-7 ${
                    isDisabled
                      ? "text-blue-700"
                      : "text-zinc-600"
                  }`}
                >
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
                        className={
                          isDisabled
                            ? "text-blue-600"
                            : "text-green-600"
                        }
                      />

                      <span
                        className={`text-sm ${
                          isDisabled
                            ? "text-blue-800"
                            : "text-zinc-700"
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {isDisabled && (
                  <div className="mt-8 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-100 px-4 py-3 text-blue-800">
                    <LockKeyhole size={18} />
                    Free trial already used
                  </div>
                )}

                {isSelected && !isDisabled && (
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
          type="button"
          onClick={handleContinue}
          disabled={!selectedPlan || submitting}
          className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-violet-700 py-5 text-lg font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
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
              {trialExpired ? "Upgrade Now" : "Continue"}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </section>
    </main>
  );
}