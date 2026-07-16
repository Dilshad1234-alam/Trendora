"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Crown,
  LoaderCircle,
  Sparkles,
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
  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();

        const currentUser =
          data.user || data.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (!currentUser.role) {
          router.replace(
            "/onboarding/select-role"
          );
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
          router.replace(
            currentUser.role === "creator"
              ? "/creator/dashboard"
              : "/business/dashboard"
          );
          return;
        }

        setUser(currentUser);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

const handleContinue = async () => {
  if (!selectedPlan) {
    setMessage("Please select a plan.");
    return;
  }

  try {
    setSubmitting(true);
    setMessage("");

    const response = await selectPlan(selectedPlan);

    console.log("Select plan response:", response);

    if (response.success && response.data?.nextRoute) {
      router.replace(response.data.nextRoute);
      router.refresh();
      return;
    }

    setMessage("Dashboard route not found.");
  } catch (error) {
    setMessage(
      error.message || "Unable to activate plan."
    );
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030014] text-white">
        <LoaderCircle
          size={30}
          className="animate-spin text-violet-400"
        />
      </main>
    );
  }

  const isCreator = user?.role === "creator";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030014] px-4 py-10 text-white sm:px-6">
      <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[140px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
            <Sparkles size={26} />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
            Onboarding completed
          </p>

          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
            Choose your Trendora plan
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            Your {isCreator ? "creator" : "business"} profile
            is ready. Select a plan to open your dashboard.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setSelectedPlan("free")}
            className={`rounded-3xl border p-7 text-left transition ${
              selectedPlan === "free"
                ? "border-violet-400 bg-violet-500/10 shadow-[0_0_35px_rgba(139,92,246,0.18)]"
                : "border-white/10 bg-white/[0.03] hover:border-white/20"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-violet-300">
                  Free Plan
                </p>

                <h2 className="mt-2 text-3xl font-extrabold">
                  ₹0
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Free forever
                </p>
              </div>

              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                  selectedPlan === "free"
                    ? "border-violet-400 bg-violet-500"
                    : "border-zinc-600"
                }`}
              >
                {selectedPlan === "free" && (
                  <Check size={15} />
                )}
              </span>
            </div>

            <div className="mt-7 space-y-3">
              {[
                "Daily AI content plan",
                "Hook generator",
                "Script generator",
                "Caption generator",
                "Hashtag generator",
                "Thumbnail title generator",
                "Video description generator",
                "Saved content library",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-sm text-zinc-300"
                >
                  <Check
                    size={16}
                    className="text-emerald-400"
                  />
                  {feature}
                </div>
              ))}
            </div>
          </button>

          <div className="relative rounded-3xl border border-white/10 bg-white/[0.025] p-7 opacity-60">
            <span className="absolute right-5 top-5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              Coming soon
            </span>

            <Crown
              size={28}
              className="text-amber-400"
            />

            <p className="mt-5 text-sm font-semibold text-amber-300">
              {isCreator
                ? "Creator Pro"
                : "Business Pro"}
            </p>

            <h2 className="mt-2 text-3xl font-extrabold">
              Upgrade later
            </h2>

            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Unlock higher usage limits, weekly plans,
              analytics and advanced AI tools.
            </p>
          </div>
        </div>

        {message && (
          <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {message}
          </div>
        )}

        <div className="mx-auto mt-8 max-w-4xl">
            <button
                type="button"
                onClick={handleContinue}
                disabled={submitting || !selectedPlan}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-4 font-semibold text-white shadow-[0_0_25px_rgba(139,92,246,0.3)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {submitting ? (
                <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Activating plan...
                </>
                ) : (
                <>
                    {selectedPlan
                    ? "Continue to dashboard"
                    : "Select a plan first"}
                    <ArrowRight size={18} />
                </>
                )}
            </button>
        </div>
      </div>
    </main>
  );
}