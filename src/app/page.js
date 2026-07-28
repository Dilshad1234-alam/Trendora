import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Building2,
  Check,
  FileText,
  Flame,
  Hash,
  ImageIcon,
  Lightbulb,
  MessageSquareText,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  WandSparkles,
  Zap,
  Briefcase,
  ChevronDown
} from "lucide-react";

const pricingConfig = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    interval: "forever",
    description: "Start building your content workflow with zero risk.",
    features: ["Limited AI", "Limited Daily Usage"],
    buttonText: "Start Free",
    buttonLink: "/register",
    highlight: false
  },
  {
    id: "creator-pro",
    name: "Creator Pro",
    price: "₹499",
    interval: "per month",
    description: "Unlock unlimited tools to grow your personal brand.",
    features: ["Unlimited Hooks", "Unlimited Scripts", "Unlimited Captions", "Unlimited Hashtags", "Priority AI"],
    buttonText: "Start Free",
    buttonLink: "/register?workspace=creator",
    highlight: false
  },
  {
    id: "business-pro",
    name: "Business Pro",
    price: "₹999",
    interval: "per month",
    description: "Generate unlimited marketing materials for your local business.",
    features: ["Business Posts", "Ads", "SEO", "Review Reply", "Priority AI"],
    buttonText: "Start Free",
    buttonLink: "/register?workspace=business",
    highlight: false
  },
  {
    id: "agency",
    name: "Agency",
    price: "₹2999",
    interval: "per month",
    description: "The ultimate workspace to manage unlimited clients at scale.",
    features: ["Unlimited Creator Clients", "Unlimited Business Clients", "Team Members", "Bulk AI", "Pipeline", "Reports", "Calendar", "Notifications", "White Label", "Activity Logs"],
    buttonText: "Start Free",
    buttonLink: "/register?workspace=agency",
    highlight: true
  }
];

const faqData = [
  { q: "Who should buy Creator Pro?", a: "Creator Pro is ideal for YouTubers, Instagram Influencers, and Personal Brands who need unlimited scripts, hooks, and captions without hitting any daily limits." },
  { q: "Who should buy Business Pro?", a: "Business Pro is perfect for local businesses, clinics, restaurants, and startups looking to generate posts, review replies, and local SEO strategies consistently." },
  { q: "Who should buy Agency?", a: "The Agency plan is built for marketing agencies, freelancers, and social media managers who handle multiple clients and need a unified dashboard, white labeling, and team collaboration." },
  { q: "Can I upgrade later?", a: "Absolutely! You can start on the Free plan or a Pro plan and upgrade to Agency at any time directly from your dashboard." },
  { q: "Can I downgrade later?", a: "Yes, you can downgrade your plan from your billing settings before your next billing cycle begins." },
  { q: "Can I switch plans?", a: "Yes, you can switch seamlessly between Creator Pro, Business Pro, and Agency depending on what fits your current needs best." },
];

const creatorTools = [
  {
    title: "Hook Generator",
    description: "Create attention-grabbing hooks for reels and short videos.",
    icon: Flame,
  },
  {
    title: "Script Generator",
    description: "Generate ready-to-record scripts based on your niche.",
    icon: FileText,
  },
  {
    title: "Caption Generator",
    description: "Write engaging captions with strong calls to action.",
    icon: MessageSquareText,
  },
  {
    title: "Hashtag Generator",
    description: "Find broad, niche and relevant hashtags for your content.",
    icon: Hash,
  },
  {
    title: "Thumbnail Titles",
    description: "Generate short and clickable thumbnail title ideas.",
    icon: ImageIcon,
  },
  {
    title: "Video Description",
    description: "Create SEO-friendly descriptions, keywords and hashtags.",
    icon: Search,
  },
];

const businessTools = [
  {
    title: "Business Post Generator",
    description: "Create promotional and educational social media posts.",
    icon: FileText,
  },
  {
    title: "Business Caption Generator",
    description: "Generate captions designed for local business growth.",
    icon: MessageSquareText,
  },
  {
    title: "Local SEO",
    description: "Discover location-based keywords for better visibility.",
    icon: Search,
  },
  {
    title: "Review Reply",
    description: "Create professional responses to customer reviews.",
    icon: Star,
  },
  {
    title: "Growth Plan",
    description: "Get personalized daily and weekly marketing actions.",
    icon: TrendingUp,
  },
  {
    title: "Saved Library",
    description: "Save, search and reuse your best AI-generated content.",
    icon: Bookmark,
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Register securely and choose whether you want to use the Creator or Business workspace.",
  },
  {
    number: "02",
    title: "Start Free",
    description:
      "Enjoy a free trial with zero risk to see exactly how Trendora can accelerate your growth.",
  },
  {
    number: "03",
    title: "Generate with AI",
    description:
      "Create hooks, scripts, captions, posts, and manage clients in a single unified dashboard.",
  },
  {
    number: "04",
    title: "Upgrade anytime",
    description:
      "When you are ready to scale, choose Creator Pro, Business Pro, or our powerful Agency plan.",
  },
];

const benefits = [
  "Personalized results based on your profile",
  "Creator and business workspaces",
  "Daily AI-powered content plans",
  "Copy and save generated content",
  "Mobile-friendly responsive design",
  "Fast and simple content workflow",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 scroll-smooth">
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

          <div className="hidden items-center gap-6 text-sm font-medium text-zinc-600 lg:flex">
            <Link href="/" className="transition hover:text-violet-700">Home</Link>
            <Link href="#features" className="transition hover:text-violet-700">Features</Link>
            <Link href="#pricing" className="transition hover:text-violet-700">Pricing</Link>
            <Link href="/creator" className="transition hover:text-violet-700">Creator</Link>
            <Link href="/business" className="transition hover:text-violet-700">Business</Link>
            <Link href="/agency" className="transition hover:text-violet-700">Agency</Link>
            <Link href="#faq" className="transition hover:text-violet-700">FAQ</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-800"
            >
              Start Free
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
        <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
            <WandSparkles size={17} />
            AI-powered growth workspace
          </div>

          <h1 className="mx-auto mt-7 max-w-5xl text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
            AI Workspace for Creators,
            <span className="block bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Businesses & Agencies
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-zinc-600 sm:text-lg">
            Generate content, grow your audience, manage clients and scale your workflow using AI.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-semibold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 sm:w-auto"
            >
              Start Free
              <ArrowRight size={18} />
            </Link>

            <Link
              href="#pricing"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3.5 font-semibold text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 sm:w-auto"
            >
              View Pricing
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold text-zinc-500">
            <span className="flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              Creator
            </span>

            <span className="flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              Business
            </span>

            <span className="flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              Agency
            </span>
          </div>

          {/* Dashboard preview */}
          <div className="mx-auto mt-16 max-w-6xl rounded-[2rem] border border-zinc-200 bg-white p-3 shadow-2xl shadow-violet-200/50 sm:p-5">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-[#f7f7fb]">
              <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>

                <div className="rounded-lg bg-zinc-100 px-5 py-2 text-xs text-zinc-500">
                  trendora.app/dashboard
                </div>

                <div className="w-14" />
              </div>

              <div className="grid gap-5 p-5 text-left md:grid-cols-[220px_1fr] sm:p-7">
                <aside className="hidden rounded-2xl bg-zinc-950 p-5 text-white md:block">
                  <div className="flex items-center gap-2 font-bold">
                    <Sparkles size={18} />
                    Trendora
                  </div>

                  <div className="mt-8 space-y-3 text-sm">
                    {[
                      "Dashboard",
                      "AI Generators",
                      "Daily Plan",
                      "Saved Content",
                      "Analytics",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-xl px-3 py-2.5 ${
                          index === 0
                            ? "bg-violet-700 text-white"
                            : "text-zinc-400"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>

                <div>
                  <div className="rounded-2xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-600 p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">
                      Today&apos;s AI plan
                    </p>

                    <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                      Create one useful short video for your audience
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100">
                      Start with a strong hook, share one clear idea and finish
                      with a direct call to action.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: "Saved Hooks",
                        value: "18",
                        icon: Flame,
                      },
                      {
                        label: "Scripts",
                        value: "12",
                        icon: FileText,
                      },
                      {
                        label: "Captions",
                        value: "24",
                        icon: MessageSquareText,
                      },
                      {
                        label: "Growth Score",
                        value: "82%",
                        icon: BarChart3,
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-zinc-200 bg-white p-4"
                        >
                          <Icon size={19} className="text-violet-700" />

                          <p className="mt-4 text-xs text-zinc-500">
                            {item.label}
                          </p>

                          <p className="mt-1 text-xl font-bold text-zinc-900">
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Workspace */}
      <section id="workspaces" className="border-t border-zinc-200 bg-zinc-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Workspaces
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Choose your ideal setup
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-600">
              Trendora provides tailored workspaces designed specifically for your goals.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {/* Creator */}
            <div className="flex flex-col rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:shadow-violet-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <Users size={28} />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-zinc-950">Creator</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Perfect for YouTubers, Instagram Creators, Influencers and Personal Brands.
              </p>
              <div className="mt-8 flex-1 space-y-4">
                {["Hooks", "Scripts", "Captions", "Hashtags", "Planner"].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                    <Check size={18} className="text-violet-600" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/creator" className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-50 px-5 py-3.5 font-semibold text-violet-700 transition hover:bg-violet-100">
                Explore Creator
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Business */}
            <div className="flex flex-col rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:shadow-violet-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <Building2 size={28} />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-zinc-950">Business</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Perfect for Restaurants, Hotels, Clinics, Salons, Startups and Local Businesses.
              </p>
              <div className="mt-8 flex-1 space-y-4">
                {["Business Posts", "Ads", "SEO", "Review Reply", "WhatsApp Reply"].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                    <Check size={18} className="text-violet-600" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/business" className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-50 px-5 py-3.5 font-semibold text-violet-700 transition hover:bg-violet-100">
                Explore Business
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Agency */}
            <div className="relative flex flex-col rounded-[2rem] border-2 border-violet-600 bg-white p-8 shadow-2xl shadow-violet-200">
              <div className="absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                <Star size={14} fill="currentColor" /> Most Popular
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <Briefcase size={28} />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-zinc-950">Agency</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Perfect for Freelancers, Marketing Agencies and Social Media Managers.
              </p>
              <div className="mt-8 flex-1 space-y-4">
                {["Unlimited Clients", "Creator Clients", "Business Clients", "Team Members", "Reports", "Pipeline", "Calendar", "White Label", "Bulk AI"].map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                    <Check size={18} className="text-violet-600" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/agency" className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3.5 font-semibold text-white transition hover:bg-violet-800">
                Explore Agency
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main features */}
      <section
        id="features"
        className="border-y border-zinc-200 bg-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Everything in one place
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              From idea to published content
            </h2>

            <p className="mt-5 text-base leading-7 text-zinc-600">
              Trendora personalizes every result using your niche, platform,
              tone, audience and growth goals.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Personalized AI",
                description:
                  "Results are generated using your creator or business profile.",
                icon: Sparkles,
              },
              {
                title: "Daily Growth Plans",
                description:
                  "Receive practical content and marketing actions every day.",
                icon: TrendingUp,
              },
              {
                title: "Complete Content Workflow",
                description:
                  "Generate hooks, scripts, captions, hashtags and descriptions.",
                icon: Zap,
              },
              {
                title: "Saved Content Library",
                description:
                  "Save, search, copy and reuse your best generated content.",
                icon: Bookmark,
              },
              {
                title: "Creator Workspace",
                description:
                  "Tools designed for reels, short videos and personal brands.",
                icon: Users,
              },
              {
                title: "Business Workspace",
                description:
                  "Create posts, improve local SEO and reply to reviews.",
                icon: Building2,
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-zinc-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-zinc-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Creator section */}
      <section id="creators" className="bg-zinc-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
                <Users size={17} />
                Built for creators
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                Create consistently without staring at a blank screen
              </h2>

              <p className="mt-5 text-base leading-8 text-zinc-600">
                Trendora learns about your niche, audience, tone and platform
                to create content that fits your personal brand.
              </p>

              <Link
                href="/register"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white transition hover:bg-violet-800"
              >
                Start as a creator
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {creatorTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <article
                    key={tool.title}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-4 font-bold text-zinc-900">
                      {tool.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {tool.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Business section */}
      <section id="business" className="bg-zinc-950 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {businessTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <article
                    key={tool.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-4 font-bold text-white">
                      {tool.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {tool.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-300">
                <Building2 size={17} />
                Built for local businesses
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                Turn your business information into marketing content
              </h2>

              <p className="mt-5 text-base leading-8 text-zinc-400">
                Create posts, captions, local keywords and customer replies
                using your services, city and target audience.
              </p>

              <Link
                href="/register"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 transition hover:bg-violet-100"
              >
                Start as a business
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Agency */}
      <section className="bg-zinc-900 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-400">
                Scale Your Business
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
                Why Agency Plan?
              </h2>
              <p className="mt-6 text-base leading-8 text-zinc-400">
                Let&apos;s look at a real example. Rahul runs a marketing agency. He manages ABC Restaurant, Royal Gym, Hotel Paradise, and a Dental Clinic.
              </p>
              <p className="mt-4 text-base leading-8 text-zinc-400">
                Instead of using ChatGPT separately for every client, losing brand voice, and constantly copy-pasting, Trendora lets Rahul:
              </p>
              <div className="mt-8 flex flex-col gap-3 font-semibold text-zinc-200">
                <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/10">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-xs text-violet-300">1</span>
                  Select Client
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/10">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-xs text-violet-300">2</span>
                  Generate Content
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/10">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-xs text-violet-300">3</span>
                  Save & Approve
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/10">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-xs text-violet-300">4</span>
                  Generate Reports
                </div>
              </div>
            </div>
            
            <div className="rounded-3xl border border-violet-500/30 bg-violet-500/10 p-8 lg:p-12">
              <h3 className="text-2xl font-bold text-white mb-4">Everything from one dashboard</h3>
              <p className="text-zinc-300 leading-relaxed mb-8">
                Manage 100+ clients with unique profiles, tones, and history. Build a pipeline and assign team members.
              </p>
              
              <div className="rounded-2xl bg-black/40 p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Lightbulb className="text-amber-400" size={24} />
                  <span className="font-bold text-white">Important Note</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Trendora DOES NOT provide clients for your agency. Users bring their own existing clients to the platform. Trendora simply provides the ultimate professional AI workspace to manage and deliver for them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Use Cases */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Built for Scale
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Real Use Cases
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900">Freelancer</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Manage multiple client businesses from one powerful dashboard without juggling separate tools.
              </p>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900">Marketing Agency</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Manage 100+ clients seamlessly with dedicated client profiles, team members and beautiful reports.
              </p>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900">Content Creator Agency</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Manage multiple personal brands and creators. Generate personalized scripts and hooks in seconds using AI.
              </p>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-900">Business Group</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Manage multiple brands and local branches, ensuring brand voice consistency across all locations.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-zinc-200 bg-zinc-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Simple workflow
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Start creating in four steps
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <span className="text-5xl font-black text-violet-100">
                  {step.number}
                </span>

                <h3 className="mt-4 text-lg font-bold text-zinc-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Pricing Plans
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Choose the right plan for you
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pricingConfig.map((plan) => (
              <div 
                key={plan.id}
                className={`relative flex flex-col rounded-[2rem] border-2 bg-white p-8 ${plan.highlight ? 'border-violet-600 shadow-xl shadow-violet-200' : 'border-zinc-200 shadow-sm'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-950">{plan.price}</span>
                  <span className="text-sm font-medium text-zinc-500">/{plan.interval}</span>
                </div>
                
                <p className="mt-4 text-sm text-zinc-600">{plan.description}</p>
                
                <Link
                  href={plan.buttonLink}
                  className={`mt-8 flex justify-center rounded-xl px-5 py-3.5 font-bold transition ${plan.highlight ? 'bg-violet-700 text-white hover:bg-violet-800' : 'bg-violet-50 text-violet-700 hover:bg-violet-100'}`}
                >
                  {plan.buttonText}
                </Link>

                <div className="mt-8 flex-1 space-y-4">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-3 text-sm text-zinc-700">
                      <Check size={16} className="mt-0.5 shrink-0 text-violet-600" /> 
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Compare Plans Table */}
          <div className="mt-24 overflow-x-auto rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="p-6 font-bold text-zinc-900">Features</th>
                  <th className="p-6 font-bold text-zinc-900">Free</th>
                  <th className="p-6 font-bold text-zinc-900">Creator Pro</th>
                  <th className="p-6 font-bold text-zinc-900">Business Pro</th>
                  <th className="p-6 font-bold text-violet-700">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {[
                  { name: "Hooks, Scripts & Captions", f: "Limited", cp: "Unlimited", bp: "-", a: "Unlimited" },
                  { name: "Business Posts & Ads", f: "Limited", cp: "-", bp: "Unlimited", a: "Unlimited" },
                  { name: "Local SEO & Review Reply", f: "Limited", cp: "-", bp: "Unlimited", a: "Unlimited" },
                  { name: "Creator Clients", f: "-", cp: "-", bp: "-", a: "Unlimited" },
                  { name: "Business Clients", f: "-", cp: "-", bp: "-", a: "Unlimited" },
                  { name: "Team Members", f: "-", cp: "-", bp: "-", a: "Yes" },
                  { name: "Pipeline & Calendar", f: "-", cp: "-", bp: "-", a: "Yes" },
                  { name: "Reports & White Label", f: "-", cp: "-", bp: "-", a: "Yes" },
                  { name: "Priority Support", f: "-", cp: "Yes", bp: "Yes", a: "Yes" },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="p-6 font-medium text-zinc-900">{row.name}</td>
                    <td className="p-6 text-zinc-600">{row.f === "-" ? <span className="text-zinc-300">—</span> : row.f}</td>
                    <td className="p-6 text-zinc-600">{row.cp === "Yes" ? <Check size={18} className="text-emerald-500"/> : row.cp === "-" ? <span className="text-zinc-300">—</span> : row.cp}</td>
                    <td className="p-6 text-zinc-600">{row.bp === "Yes" ? <Check size={18} className="text-emerald-500"/> : row.bp === "-" ? <span className="text-zinc-300">—</span> : row.bp}</td>
                    <td className="p-6 font-semibold text-violet-700">{row.a === "Yes" ? <Check size={18} className="text-violet-600"/> : row.a === "-" ? <span className="text-zinc-300">—</span> : row.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-violet-50 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Why Trendora
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Spend less time planning and more time growing
            </h2>

            <p className="mt-5 text-base leading-8 text-zinc-600">
              Trendora combines content creation, organization and daily
              guidance in one easy-to-use AI workspace.
            </p>
          </div>

          <div className="rounded-3xl border border-violet-200 bg-white p-6 shadow-xl shadow-violet-100 sm:p-8">
            <div className="space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={15} />
                  </span>

                  <p className="text-sm font-medium leading-6 text-zinc-700 sm:text-base">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-bold text-zinc-900">
                  {faq.q}
                  <span className="transition duration-300 group-open:-rotate-180">
                    <ChevronDown size={20} className="text-violet-700" />
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-zinc-600">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-600 px-6 py-14 text-center text-white shadow-2xl shadow-violet-200 sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles size={27} />
          </div>

          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black sm:text-5xl">
            Your next great content idea starts here
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-violet-100">
            Join Trendora and turn your ideas, business goals and audience
            insights into ready-to-use content.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Start Free
              <ArrowRight size={18} />
            </Link>

            <Link
              href="#pricing"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white transition hover:bg-white/15"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/Trendora_Landing_Logo.png"
                alt="Trendora Logo"
                width={240}
                height={70}
                priority
                className="h-14 w-auto object-contain brightness-0 invert"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-400">
              AI-powered content and growth workspace for creators, businesses and agencies.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Product</h3>

            <div className="mt-4 space-y-3 text-sm text-zinc-400">
              <Link href="#features" className="block hover:text-white">
                Features
              </Link>
              <Link href="#pricing" className="block hover:text-white">
                Pricing
              </Link>
              <Link href="/creator" className="block hover:text-white">
                Creator Workspace
              </Link>
              <Link href="/business" className="block hover:text-white">
                Business Workspace
              </Link>
              <Link href="/agency" className="block hover:text-white">
                Agency Workspace
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Account</h3>

            <div className="mt-4 space-y-3 text-sm text-zinc-400">
              <Link href="/register" className="block hover:text-white">
                Start Free
              </Link>
              <Link href="/login" className="block hover:text-white">
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Trendora. All rights reserved.
        </div>
      </footer>
    </main>
  );
}