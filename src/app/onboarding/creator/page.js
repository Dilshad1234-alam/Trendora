"use client";

import { useState } from "react";
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
  UserRound,
} from "lucide-react";

import { completeCreatorOnboarding } from "@/services/onboarding.api";

const TOTAL_STEPS = 5;

const NICHE_OPTIONS = [
  {
    value: "technology",
    label: "Technology",
  },
  {
    value: "education",
    label: "Education",
  },
  {
    value: "motivation",
    label: "Motivation",
  },
  {
    value: "fashion",
    label: "Fashion",
  },
  {
    value: "islamic-content",
    label: "Islamic Content",
  },
  {
    value: "finance",
    label: "Finance",
  },
  {
    value: "fitness",
    label: "Fitness",
  },
  {
    value: "food",
    label: "Food",
  },
  {
    value: "travel",
    label: "Travel",
  },
  {
    value: "gaming",
    label: "Gaming",
  },
  {
    value: "beauty",
    label: "Beauty",
  },
  {
    value: "other",
    label: "Other",
  },
];

const LANGUAGE_OPTIONS = [
  {
    value: "hindi",
    label: "Hindi",
  },
  {
    value: "english",
    label: "English",
  },
  {
    value: "hinglish",
    label: "Hinglish",
  },
  {
    value: "urdu",
    label: "Urdu",
  },
  {
    value: "bhojpuri",
    label: "Bhojpuri",
  },
];

const PLATFORM_OPTIONS = [
  {
    value: "instagram",
    label: "Instagram",
  },
  {
    value: "youtube",
    label: "YouTube",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
  },
  {
    value: "facebook",
    label: "Facebook",
  },
  {
    value: "twitter",
    label: "X / Twitter",
  },
];

const TONE_OPTIONS = [
  {
    value: "professional",
    label: "Professional",
  },
  {
    value: "friendly",
    label: "Friendly",
  },
  {
    value: "educational",
    label: "Educational",
  },
  {
    value: "emotional",
    label: "Emotional",
  },
  {
    value: "funny",
    label: "Funny",
  },
  {
    value: "motivational",
    label: "Motivational",
  },
];

const AUDIENCE_OPTIONS = [
  {
    value: "0-1k",
    label: "0–1K",
    description: "Just getting started",
  },
  {
    value: "1k-10k",
    label: "1K–10K",
    description: "Growing creator",
  },
  {
    value: "10k-50k",
    label: "10K–50K",
    description: "Established audience",
  },
  {
    value: "50k-plus",
    label: "50K+",
    description: "Large creator audience",
  },
];

const GOAL_OPTIONS = [
  {
    value: "followers",
    label: "Grow Followers",
  },
  {
    value: "views",
    label: "Increase Views",
  },
  {
    value: "personal-brand",
    label: "Build Personal Brand",
  },
  {
    value: "leads",
    label: "Generate Leads",
  },
  {
    value: "earning",
    label: "Earn Money",
  },
  {
    value: "community",
    label: "Build Community",
  },
];

export default function CreatorOnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    niche: "",
    customNiche: "",
    language: "",
    platform: "",
    tone: "",
    audienceSize: "",
    goal: "",
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  const inputClass =
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

  const labelClass =
    "mb-2 block text-sm font-semibold text-zinc-700";

  const clearMessage = () => {
    setMessage({
      type: "",
      text: "",
    });
  };

  const showError = (text) => {
    setMessage({
      type: "error",
      text,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    clearMessage();
  };

  const selectOption = (fieldName, value) => {
    setFormData((previousData) => ({
      ...previousData,
      [fieldName]: value,
    }));

    clearMessage();
  };

  const validateCurrentStep = () => {
    if (step === 1 && !formData.niche) {
      showError("Please select your content niche.");
      return false;
    }

    if (
      step === 1 &&
      formData.niche === "other" &&
      !formData.customNiche.trim()
    ) {
      showError("Please enter your content niche.");
      return false;
    }

    if (step === 2 && !formData.language) {
      showError("Please select your content language.");
      return false;
    }

    if (step === 3 && !formData.platform) {
      showError("Please select your primary platform.");
      return false;
    }

    if (step === 4 && !formData.tone) {
      showError("Please select your content tone.");
      return false;
    }

    if (
      step === 5 &&
      (!formData.audienceSize || !formData.goal)
    ) {
      showError(
        "Please select your audience size and primary goal."
      );
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    clearMessage();

    setStep((currentStep) =>
      Math.min(currentStep + 1, TOTAL_STEPS)
    );
  };

  const handleBack = () => {
    clearMessage();

    setStep((currentStep) =>
      Math.max(currentStep - 1, 0)
    );
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    try {
      setLoading(true);
      clearMessage();

      const payload = {
        niche:
          formData.niche === "other"
            ? formData.customNiche.trim()
            : formData.niche,
        language: formData.language,
        platform: formData.platform,
        tone: formData.tone,
        audienceSize: formData.audienceSize,
        goal: formData.goal,
      };

      const data =
        await completeCreatorOnboarding(payload);

      const nextRoute =
        data?.nextRoute ||
        data?.data?.nextRoute ||
        "/creator/dashboard";

      router.replace(nextRoute);
      router.refresh();
    } catch (error) {
      showError(
        error?.message || "Creator onboarding failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderOptionCard = ({
    fieldName,
    value,
    label,
    description,
  }) => {
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
        <span>
          <span className="block font-semibold">
            {label}
          </span>

          {description && (
            <span
              className={`mt-1 block text-xs ${
                isSelected
                  ? "text-violet-600"
                  : "text-zinc-500"
              }`}
            >
              {description}
            </span>
          )}
        </span>

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
            <Sparkles
              size={14}
              className="text-violet-700"
            />

            <span className="text-xs font-semibold text-violet-700">
              Creator Onboarding
            </span>
          </div>
        </nav>
      </header>

      {/* Main section */}
      <section className="relative min-h-[calc(100vh-89px)] overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
        <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-violet-100/70">
            {/* Card header */}
            <div className="border-b border-zinc-100 bg-zinc-50 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white">
                  <UserRound size={22} />
                </div>

                <div>
                  <h1 className="font-bold text-zinc-900">
                    Creator Profile Setup
                  </h1>

                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                    Answer a few questions to personalize your
                    creator workspace.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-500">
                    {step === 0
                      ? "Getting Started"
                      : `Step ${step} of ${TOTAL_STEPS}`}
                  </p>

                  <p className="text-sm font-semibold text-violet-700">
                    {progress}%
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-violet-100">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              </div>

              {/* Step 0 */}
              {step === 0 && (
                <div className="py-6 text-center sm:py-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <Sparkles size={30} />
                  </div>

                  <h2 className="mt-6 text-3xl font-black text-zinc-950">
                    Let&apos;s personalize your creator journey
                  </h2>

                  <p className="mx-auto mt-3 max-w-lg leading-7 text-zinc-500">
                    Tell us about your content so Trendora can
                    generate better hooks, scripts, captions,
                    hashtags and growth suggestions.
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

              {/* Step 1: Niche */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-zinc-950">
                    What is your content niche?
                  </h2>

                  <p className="mt-2 leading-7 text-zinc-500">
                    Select the category that best describes
                    your content.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {NICHE_OPTIONS.map((option) =>
                      renderOptionCard({
                        fieldName: "niche",
                        value: option.value,
                        label: option.label,
                      })
                    )}
                  </div>

                  {formData.niche === "other" && (
                    <div className="mt-6">
                      <label
                        htmlFor="customNiche"
                        className={labelClass}
                      >
                        Enter Your Niche
                      </label>

                      <input
                        id="customNiche"
                        name="customNiche"
                        type="text"
                        value={formData.customNiche}
                        onChange={handleChange}
                        placeholder="Example: Photography"
                        className={inputClass}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Language */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-zinc-950">
                    Which language do you create content in?
                  </h2>

                  <p className="mt-2 leading-7 text-zinc-500">
                    Trendora will generate content in your
                    preferred language.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {LANGUAGE_OPTIONS.map((option) =>
                      renderOptionCard({
                        fieldName: "language",
                        value: option.value,
                        label: option.label,
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Platform */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-zinc-950">
                    What is your primary content platform?
                  </h2>

                  <p className="mt-2 leading-7 text-zinc-500">
                    Select the platform you want to grow first.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {PLATFORM_OPTIONS.map((option) =>
                      renderOptionCard({
                        fieldName: "platform",
                        value: option.value,
                        label: option.label,
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Tone */}
              {step === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-zinc-950">
                    What is your preferred content tone?
                  </h2>

                  <p className="mt-2 leading-7 text-zinc-500">
                    This tone will be used in your AI-generated
                    hooks, scripts and captions.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {TONE_OPTIONS.map((option) =>
                      renderOptionCard({
                        fieldName: "tone",
                        value: option.value,
                        label: option.label,
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Audience and Goal */}
              {step === 5 && (
                <div>
                  <h2 className="text-2xl font-bold text-zinc-950">
                    Tell us about your growth stage
                  </h2>

                  <p className="mt-2 leading-7 text-zinc-500">
                    Select your current audience size and main
                    creator goal.
                  </p>

                  <div className="mt-8">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                      Audience Size
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {AUDIENCE_OPTIONS.map((option) =>
                        renderOptionCard({
                          fieldName: "audienceSize",
                          value: option.value,
                          label: option.label,
                          description: option.description,
                        })
                      )}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                      Primary Goal
                    </h3>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {GOAL_OPTIONS.map((option) =>
                        renderOptionCard({
                          fieldName: "goal",
                          value: option.value,
                          label: option.label,
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {message.text && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
                    !
                  </span>

                  <p>{message.text}</p>
                </div>
              )}

              {/* Buttons */}
              {step > 0 && (
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3.5 font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>

                  {step < TOTAL_STEPS ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-semibold text-white transition hover:bg-violet-800"
                    >
                      Continue
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <LoaderCircle
                            size={18}
                            className="animate-spin"
                          />
                          Completing...
                        </>
                      ) : (
                        <>
                          Complete Onboarding
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Security note */}
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-500">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-violet-600"
                />

                <p>
                  Trendora will not post anything to your social
                  media accounts. Your answers are only used to
                  personalize AI-generated content and growth
                  suggestions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}







// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import { ArrowRight, LoaderCircle, Sparkles, Check } from "lucide-react";
// import { completeCreatorOnboarding } from "@/services/onboarding.api";

// export default function CreatorOnboardingPage() {
//   const router = useRouter();

//   const [formData, setFormData] = useState({
//     niche: "",
//     language: "",
//     platform: "",
//     tone: "",
//     audienceSize: "",
//     goal: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setFormData((previousData) => ({
//       ...previousData,
//       [name]: value,
//     }));

//     setMessage("");
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     const { niche, language, platform, tone, audienceSize, goal } = formData;

//     if (!niche || !language || !platform || !tone || !audienceSize || !goal) {
//       setMessage("Please fill in all fields.");
//       return;
//     }

//     try {
//       setLoading(true);

//       const data = await completeCreatorOnboarding(formData);

//       router.replace(data.nextRoute || "/creator/dashboard");
//     } catch (error) {
//       setMessage(error.message || "Creator onboarding failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectClass =
//     "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3.5 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 appearance-none cursor-pointer";

//   const labelClass =
//     "mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500";

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
//               Creator Onboarding
//             </span>
//           </div>
//         </nav>
//       </header>

//       {/* Main Content */}
//       <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
//         <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/25 blur-3xl" />

//         <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
//           {/* Header */}
//           <div className="mb-10 text-center">
//             <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
//               <Sparkles size={26} />
//             </div>

//             <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
//               Creator Onboarding
//             </p>

//             <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
//               Tell us about your{" "}
//               <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
//                 content
//               </span>
//             </h1>

//             <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
//               Trendora will use this information to personalize trends,
//               scripts and growth suggestions for you.
//             </p>
//           </div>

//           {/* Form Card */}
//           <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-violet-100 sm:p-10">
//             {/* Message Alert */}
//             {message && (
//               <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm flex items-start gap-3 text-red-700">
//                 <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
//                   <span className="font-bold text-xs leading-none">!</span>
//                 </span>
//                 <div>{message}</div>
//               </div>
//             )}

//             {/* Form Body */}
//             <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
//               <div>
//                 <label htmlFor="niche" className={labelClass}>
//                   Niche
//                 </label>
//                 <select
//                   id="niche"
//                   name="niche"
//                   value={formData.niche}
//                   onChange={handleChange}
//                   className={selectClass}
//                 >
//                   <option value="">Select niche</option>
//                   <option value="technology">Technology</option>
//                   <option value="education">Education</option>
//                   <option value="motivation">Motivation</option>
//                   <option value="fashion">Fashion</option>
//                   <option value="islamic-content">Islamic Content</option>
//                   <option value="finance">Finance</option>
//                   <option value="fitness">Fitness</option>
//                   <option value="food">Food</option>
//                   <option value="travel">Travel</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="language" className={labelClass}>
//                   Language
//                 </label>
//                 <select
//                   id="language"
//                   name="language"
//                   value={formData.language}
//                   onChange={handleChange}
//                   className={selectClass}
//                 >
//                   <option value="">Select language</option>
//                   <option value="hindi">Hindi</option>
//                   <option value="english">English</option>
//                   <option value="hinglish">Hinglish</option>
//                   <option value="urdu">Urdu</option>
//                   <option value="bhojpuri">Bhojpuri</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="platform" className={labelClass}>
//                   Platform
//                 </label>
//                 <select
//                   id="platform"
//                   name="platform"
//                   value={formData.platform}
//                   onChange={handleChange}
//                   className={selectClass}
//                 >
//                   <option value="">Select platform</option>
//                   <option value="instagram">Instagram</option>
//                   <option value="youtube">YouTube</option>
//                   <option value="linkedin">LinkedIn</option>
//                   <option value="facebook">Facebook</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="tone" className={labelClass}>
//                   Tone
//                 </label>
//                 <select
//                   id="tone"
//                   name="tone"
//                   value={formData.tone}
//                   onChange={handleChange}
//                   className={selectClass}
//                 >
//                   <option value="">Select tone</option>
//                   <option value="professional">Professional</option>
//                   <option value="friendly">Friendly</option>
//                   <option value="educational">Educational</option>
//                   <option value="emotional">Emotional</option>
//                   <option value="funny">Funny</option>
//                   <option value="motivational">Motivational</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="audienceSize" className={labelClass}>
//                   Audience size
//                 </label>
//                 <select
//                   id="audienceSize"
//                   name="audienceSize"
//                   value={formData.audienceSize}
//                   onChange={handleChange}
//                   className={selectClass}
//                 >
//                   <option value="">Select audience size</option>
//                   <option value="0-1k">0–1K</option>
//                   <option value="1k-10k">1K–10K</option>
//                   <option value="10k-50k">10K–50K</option>
//                   <option value="50k-plus">50K+</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="goal" className={labelClass}>
//                   Primary goal
//                 </label>
//                 <select
//                   id="goal"
//                   name="goal"
//                   value={formData.goal}
//                   onChange={handleChange}
//                   className={selectClass}
//                 >
//                   <option value="">Select goal</option>
//                   <option value="followers">Grow followers</option>
//                   <option value="views">Increase views</option>
//                   <option value="personal-brand">Build personal brand</option>
//                   <option value="leads">Generate leads</option>
//                   <option value="earning">Earn money</option>
//                   <option value="community">Build community</option>
//                 </select>
//               </div>

//               <div className="sm:col-span-2 mt-2">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   {loading ? (
//                     <>
//                       <LoaderCircle size={18} className="animate-spin" />
//                       Saving profile...
//                     </>
//                   ) : (
//                     <>
//                       Complete onboarding
//                       <ArrowRight
//                         size={18}
//                         className="group-hover:translate-x-1 transition-transform"
//                       />
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Info badges */}
//           <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-500">
//             <span className="flex items-center gap-2">
//               <Check size={15} className="text-emerald-600" />
//               Personalized AI results
//             </span>
//             <span className="flex items-center gap-2">
//               <Check size={15} className="text-emerald-600" />
//               Updated anytime from settings
//             </span>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }