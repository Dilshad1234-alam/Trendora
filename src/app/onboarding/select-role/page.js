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
      <main className="min-h-screen bg-[#030014] text-white flex items-center justify-center relative overflow-hidden font-sans">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
        {/* Background Dots Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3 text-violet-400">
          <LoaderCircle className="animate-spin" size={24} />
          <span className="font-medium text-zinc-300">Checking your account...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[35%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Background Dots Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative w-full max-w-4xl p-6 sm:p-12 md:p-16 rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl shadow-2xl shadow-violet-950/20">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Sparkles size={26} className="animate-pulse" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Welcome to Trendora
          </p>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            How do you want to <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">grow</span>?
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Select the option that best describes you. Trendora will personalize
            your dashboard, AI tools and growth suggestions.
          </p>

          {user?.fullname && (
            <p className="mt-3 text-xs font-semibold text-violet-300/80 uppercase tracking-wider">
              Signed in as <span className="text-white">{user.fullname}</span>
            </p>
          )}
        </div>

        {/* Message alerts */}
        {message.text && (
          <div
            className={`mx-auto mb-8 max-w-2xl rounded-xl border p-4 text-sm flex items-start gap-3 backdrop-blur-md transition-all duration-300 ${
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
                  setMessage({
                    type: "",
                    text: "",
                  });
                }}
                className={`relative rounded-3xl border text-left transition-all duration-300 p-6 sm:p-8 cursor-pointer ${
                  isSelected
                    ? "border-violet-500 bg-[#160d3d]/60 shadow-[0_0_30px_rgba(139,92,246,0.25)]"
                    : "border-white/10 bg-[#120f2e]/45 hover:border-violet-500/30 hover:bg-white/5"
                }`}
              >
                {/* Check icon */}
                <div
                  className={`absolute right-6 top-6 flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-300 ${
                    isSelected
                      ? "border-violet-500 bg-violet-600 text-white"
                      : "border-white/10 bg-black/20 text-transparent"
                  }`}
                >
                  <Check size={14} />
                </div>

                {/* Icon box */}
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                      : "bg-violet-500/10 text-violet-300"
                  }`}
                >
                  <Icon size={24} />
                </div>

                <h2 className="pr-10 text-xl font-bold text-white">
                  {role.title}
                </h2>

                <p className="mt-3 min-h-[3.5rem] text-sm leading-relaxed text-zinc-400">
                  {role.description}
                </p>

                <div className="mt-6 space-y-3">
                  {role.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-xs text-zinc-300"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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

        {/* Action Button & Note */}
        <div className="mt-10 flex flex-col items-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole || submitting}
            className="group relative flex min-w-[240px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-7 py-4 font-semibold text-white transition hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] transition-all duration-300 overflow-hidden"
          >
            {submitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Saving role...
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="mt-4 text-center text-xs leading-relaxed text-zinc-500">
            Role select hone ke baad aapka onboarding form open hoga.
          </p>
        </div>
      </div>
    </main>
  );
}