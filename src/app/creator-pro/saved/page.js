"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Copy,
  LoaderCircle,
  Search,
  Trash2,
} from "lucide-react";

import { getCurrentUser } from "@/services/auth.api";
import {
  deleteSavedContent,
  getSavedContents,
} from "@/services/saved.api";

const filters = [
  { label: "All", value: "all" },
  { label: "Hooks", value: "hook" },
  { label: "Scripts", value: "script" },
  { label: "Captions", value: "caption" },
  { label: "Hashtags", value: "hashtag" },
  { label: "Thumbnail Titles", value: "thumbnail-title" },
  { label: "Weekly Plans", value: "weekly-plan" },
];

export default function ProSavedContentPage() {
  const router = useRouter();

  const [authLoading, setAuthLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkUser() {
      try {
        const response = await getCurrentUser();

        const currentUser = response?.user || response?.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (currentUser.plan !== "creator-pro") {
          router.replace("/creator/dashboard");
          return;
        }

        if (!currentUser.onboardingCompleted) {
          router.replace("/onboarding/creator");
          return;
        }

        // Authentication successful
      } catch {
        router.replace("/login");
      } finally {
        setAuthLoading(false);
      }
    }

    checkUser();
  }, [router]);

  const loadSavedContents = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getSavedContents({
        type: selectedType,
        search,
      });

      setItems(data.data || []);
    } catch (error) {
      setMessage(error.message || "Unable to load saved content.");
    } finally {
      setLoading(false);
    }
  }, [selectedType, search]);

  useEffect(() => {
    if (authLoading) return;

    const timeout = setTimeout(() => {
      loadSavedContents();
    }, 350);

    return () => clearTimeout(timeout);
  }, [loadSavedContents, authLoading]);

  const handleCopy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedId(item.id);

      setTimeout(() => {
        setCopiedId("");
      }, 1500);
    } catch {
      setMessage("Unable to copy content.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this saved content?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMessage("");

      await deleteSavedContent(id);

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );
    } catch (error) {
      setMessage(error.message || "Unable to delete content.");
    } finally {
      setDeletingId("");
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 via-white to-white text-zinc-900">
        <LoaderCircle size={30} className="animate-spin text-amber-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      <div className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/creator-pro/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Bookmark size={22} />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
            Pro Saved Library
          </p>

          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl">
            Your Saved <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">Content</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Search, copy and reuse your generated hooks, scripts and captions.
          </p>
        </div>

        {/* Filter and Search Section */}
        <section className="mb-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedType(filter.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                    selectedType === filter.value
                      ? "bg-amber-600 text-white shadow-md shadow-amber-200"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search saved content..."
                className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-11 pr-4 text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
              />
            </div>
          </div>
        </section>

        {message && (
          <div className="mb-6 rounded-xl border p-4 text-sm flex items-start gap-3 transition-all duration-300 border-red-200 bg-red-50 text-red-700">
            <div className="p-1 rounded-md shrink-0 bg-red-100">
              <span className="text-red-600 font-bold block leading-none w-4 h-4 text-center">!</span>
            </div>
            <div>{message}</div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="flex items-center gap-3 text-amber-600">
              <LoaderCircle className="animate-spin" size={24} />
              <span className="font-medium text-zinc-600">Loading saved content...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 text-center">
            <Bookmark size={34} className="mb-4 text-zinc-400" />

            <h2 className="text-lg font-bold text-zinc-700">
              No saved content found
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              Generate a hook, script or caption and press Save to add it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-amber-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-600 tracking-wider">
                        {item.type}
                      </span>

                      <h2 className="mt-3 text-lg font-bold text-zinc-900 leading-tight">
                        {item.title}
                      </h2>

                      <p className="mt-1 text-xs text-zinc-500 font-medium">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(item)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Copy content"
                      >
                        <Copy size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete content"
                      >
                        {deletingId === item.id ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-zinc-50 border border-zinc-100 p-4 text-sm leading-relaxed text-zinc-700">
                    {item.content}
                  </div>
                </div>

                {copiedId === item.id && (
                  <p className="mt-4 text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Copied to clipboard.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
