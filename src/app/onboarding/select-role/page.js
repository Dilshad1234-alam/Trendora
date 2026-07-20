"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle className="animate-spin" size={24} />
          <span className="font-medium text-zinc-600">Checking your account...</span>
        </div>
      </main>
    );
  }

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

          <div className="flex items-center gap-2">
            {user?.fullname && (
              <span className="hidden text-sm text-zinc-500 sm:block">
                Signed in as{" "}
                <span className="font-semibold text-zinc-800">{user.fullname}</span>
              </span>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
        <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/25 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Sparkles size={26} />
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Welcome to Trendora
            </p>

            <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              How do you want to{" "}
              <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                grow
              </span>
              ?
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-600">
              Select the option that best describes you. Trendora will personalize
              your dashboard, AI tools and growth suggestions.
            </p>

            {user?.fullname && (
              <p className="mt-3 text-sm text-zinc-500">
                Signed in as{" "}
                <span className="font-semibold text-zinc-800">{user.fullname}</span>
              </p>
            )}
          </div>

          {/* Message alerts */}
          {message.text && (
            <div
              className={`mx-auto mb-8 max-w-2xl rounded-xl border p-4 text-sm flex items-start gap-3 ${
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

          {/* Role Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.id);
                    setMessage({ type: "", text: "" });
                  }}
                  className={`relative rounded-3xl border text-left transition-all duration-200 p-6 sm:p-8 cursor-pointer ${
                    isSelected
                      ? "border-violet-400 bg-violet-50 shadow-lg shadow-violet-100"
                      : "border-zinc-200 bg-white shadow-sm hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  {/* Check icon */}
                  <div
                    className={`absolute right-6 top-6 flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-200 ${
                      isSelected
                        ? "border-violet-600 bg-violet-700 text-white"
                        : "border-zinc-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check size={14} />}
                  </div>

                  {/* Icon box */}
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
                      isSelected
                        ? "bg-violet-700 text-white"
                        : "bg-violet-100 text-violet-700"
                    }`}
                  >
                    <Icon size={24} />
                  </div>

                  <h2 className="pr-10 text-xl font-bold text-zinc-900">
                    {role.title}
                  </h2>

                  <p className="mt-3 min-h-[3.5rem] text-sm leading-relaxed text-zinc-500">
                    {role.description}
                  </p>

                  <div className="mt-6 space-y-3">
                    {role.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 text-xs text-zinc-600"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check size={12} />
                        </span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="mt-10 flex flex-col items-center">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedRole || submitting}
              className="group inline-flex min-w-[240px] items-center justify-center gap-2 rounded-xl bg-violet-700 px-7 py-4 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving role...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-zinc-500">
              Role select hone ke baad aapka onboarding form open hoga.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}