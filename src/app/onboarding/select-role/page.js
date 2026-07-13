"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Check,
  LoaderCircle,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  getCurrentUser,
  selectUserRole,
} from "@/services/auth.api";

const roleOptions = [
  {
    id: "creator",
    title: "I am a Creator",
    description:
      "Get trending ideas, viral hooks, reel scripts, captions, hashtags and weekly content plans.",
    icon: UserRound,
    features: [
      "Trending topic suggestions",
      "AI hooks and reel scripts",
      "Captions and hashtags",
      "Weekly content planning",
    ],
  },
  {
    id: "business",
    title: "I own a Local Business",
    description:
      "Improve local visibility with post ideas, local SEO keywords, review replies and growth plans.",
    icon: Building2,
    features: [
      "Daily business post ideas",
      "Local SEO keyword suggestions",
      "Professional review replies",
      "Weekly growth actions",
    ],
  },
];

export default function SelectRolePage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const data = await getCurrentUser();
        const currentUser = data.user;

        setUser(currentUser);

        if (currentUser.onboardingCompleted) {
          if (currentUser.role === "creator") {
            router.replace("/creator/dashboard");
            return;
          }

          if (currentUser.role === "business") {
            router.replace("/business/dashboard");
            return;
          }

          if (currentUser.role === "admin") {
            router.replace("/admin/dashboard");
            return;
          }
        }

        if (
          currentUser.role === "creator" &&
          !currentUser.onboardingCompleted
        ) {
          router.replace("/onboarding/creator");
          return;
        }

        if (
          currentUser.role === "business" &&
          !currentUser.onboardingCompleted
        ) {
          router.replace("/onboarding/business");
        }
      } catch (error) {
        router.replace("/login");
      } finally {
        setCheckingUser(false);
      }
    };

    checkCurrentUser();
  }, [router]);

  const handleContinue = async () => {
    if (!selectedRole) {
      setMessage({
        type: "error",
        text: "Please select Creator or Local Business.",
      });

      return;
    }

    try {
      setSubmitting(true);

      const data = await selectUserRole(selectedRole);

      setMessage({
        type: "success",
        text: data.message || "Role selected successfully.",
      });

      router.push(data.nextRoute);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7fb]">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle className="animate-spin" size={24} />
          <span className="font-medium">Checking your account...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-200">
            <Sparkles size={27} />
          </div>

          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            Welcome to Trendora
          </p>

          <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
            How do you want to grow?
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
            Select the option that best describes you. Trendora will personalize
            your dashboard, AI tools and growth suggestions.
          </p>

          {user?.fullname && (
            <p className="mt-3 text-sm font-medium text-zinc-600">
              Signed in as {user.fullname}
            </p>
          )}
        </div>

        {message.text && (
          <div
            className={`mx-auto mb-6 max-w-3xl rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {roleOptions.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRole(role.id);
                  setMessage({
                    type: "",
                    text: "",
                  });
                }}
                className={`relative rounded-3xl border-2 bg-white p-7 text-left transition duration-200 sm:p-8 ${
                  isSelected
                    ? "border-violet-600 shadow-xl shadow-violet-100"
                    : "border-zinc-200 shadow-sm hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
                }`}
              >
                <div
                  className={`absolute right-6 top-6 flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                    isSelected
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-zinc-300 bg-white text-transparent"
                  }`}
                >
                  <Check size={16} />
                </div>

                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    isSelected
                      ? "bg-violet-700 text-white"
                      : "bg-violet-50 text-violet-700"
                  }`}
                >
                  <Icon size={27} />
                </div>

                <h2 className="pr-10 text-2xl font-bold text-zinc-900">
                  {role.title}
                </h2>

                <p className="mt-3 min-h-14 text-sm leading-6 text-zinc-500">
                  {role.description}
                </p>

                <div className="mt-7 space-y-3">
                  {role.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-sm text-zinc-700"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check size={14} />
                      </span>

                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-9 flex flex-col items-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole || submitting}
            className="flex min-w-56 items-center justify-center gap-2 rounded-xl bg-violet-700 px-7 py-3.5 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {submitting ? (
              <>
                <LoaderCircle size={19} className="animate-spin" />
                Saving role...
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-zinc-400">
            Role select hone ke baad aapka onboarding form open hoga.
          </p>
        </div>
      </div>
    </main>
  );
}