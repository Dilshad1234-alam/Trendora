"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

import { registerUser } from "@/services/auth.api";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (
      !formData.fullname.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "Please fill in all fields.",
      });

      return;
    }

    if (formData.fullname.trim().length < 2) {
      setMessage({
        type: "error",
        text: "Full name must contain at least 2 characters.",
      });

      return;
    }

    if (formData.password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must contain at least 6 characters.",
      });

      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });

      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setMessage({
        type: "success",
        text: data.message || "Account created successfully.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7fb] px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">
        <section className="hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <Link
            href="/"
            className="flex w-fit items-center gap-2 text-2xl font-bold"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <Sparkles size={22} />
            </span>

            Trendora
          </Link>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-200">
              AI Growth Platform
            </p>

            <h1 className="max-w-md text-4xl font-bold leading-tight">
              Create better content and grow your online presence.
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-violet-100">
              Get personalized trends, reel scripts, captions, local SEO
              keywords and weekly growth suggestions.
            </p>
          </div>

          <p className="text-sm text-violet-200">
            Built for regional creators and local businesses.
          </p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 flex items-center gap-2 text-xl font-bold text-violet-700 lg:hidden"
            >
              <Sparkles size={22} />
              Trendora
            </Link>

            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold text-violet-600">
                CREATE ACCOUNT
              </p>

              <h2 className="text-3xl font-bold text-zinc-900">
                Start growing with Trendora
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Create your free account and choose Creator or Business mode.
              </p>
            </div>

            {message.text && (
              <div
                className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="fullname"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Full name
                </label>

                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Md Dilshad Alam"
                  autoComplete="name"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="dilshad@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-zinc-700"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Enter password again"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3.5 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={19} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-violet-700 hover:text-violet-800"
              >
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}