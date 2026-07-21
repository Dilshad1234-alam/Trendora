"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Bookmark,
  Check,
  Clipboard,
  FileText,
  LoaderCircle,
  Search,
  Trash2,
} from "lucide-react";

import {
  getCurrentUser,
} from "@/services/auth.api";

import {
  deleteSavedContent,
  getSavedContents,
} from "@/services/saved.api";

const contentTypes = [
  {
    label: "All content",
    value: "all",
  },
  {
    label: "Business posts",
    value: "business-post",
  },
  {
    label: "Captions",
    value: "business-caption",
  },
  {
    label: "Hashtags",
    value: "business-hashtag",
  },
  {
    label: "Ad copies",
    value: "ad-copy",
  },
  {
    label: "Local SEO",
    value: "local-seo",
  },
  {
    label: "Review replies",
    value: "review-reply",
  },
  {
    label: "WhatsApp Replies",
    value: "whatsapp-reply",
  },
  {
    label: "Thumbnail titles",
    value: "business-thumbnail-title",
  },
  {
    label: "Video descriptions",
    value: "business-video-description",
  },
];

const formatContentType = (type = "") => {
  return type
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const formatDate = (date) => {
  if (!date) return "Unknown date";

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(date));
};

export default function BusinessSavedPage() {
  const router = useRouter();

  const [savedContents, setSavedContents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedType, setSelectedType] =
    useState("all");

  const [copiedId, setCopiedId] =
    useState("");

  const [deletingId, setDeletingId] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadSavedContents =
    useCallback(async () => {
      try {
        setLoading(true);
        setMessage("");

        const authResponse =
          await getCurrentUser();

        const currentUser =
          authResponse.user ||
          authResponse.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (
          currentUser.role !== "business"
        ) {
          if (
            currentUser.role === "creator"
          ) {
            router.replace(
              "/creator/dashboard"
            );
            return;
          }

          router.replace("/");
          return;
        }

        if (
          !currentUser.onboardingCompleted
        ) {
          router.replace(
            "/onboarding/business"
          );
          return;
        }

        const response =
          await getSavedContents({
            type: "all",
            search: "",
          });

        setSavedContents(
          response.data || []
        );
      } catch (error) {
        console.error(
          "Saved business content error:",
          error
        );

        setMessage(
          error.message ||
            "Unable to load saved content."
        );
      } finally {
        setLoading(false);
      }
    }, [router]);

  useEffect(() => {
    loadSavedContents();
  }, [loadSavedContents]);

  const filteredContents = useMemo(
    () => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return savedContents.filter(
        (item) => {
          const matchesType =
            selectedType === "all" ||
            item.type === selectedType;

          const searchableText = [
            item.title,
            item.content,
            item.type,
            item.prompt,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            searchableText.includes(
              normalizedSearch
            );

          return (
            matchesType &&
            matchesSearch
          );
        }
      );
    },
    [
      savedContents,
      search,
      selectedType,
    ]
  );

  const handleCopy = async (
    item
  ) => {
    try {
      const content =
        item.content || "";

      await navigator.clipboard.writeText(
        content
      );

      setCopiedId(item.id || item._id);

      window.setTimeout(() => {
        setCopiedId("");
      }, 1800);
    } catch {
      setMessage(
        "Unable to copy content."
      );
    }
  };

  const handleDelete = async (
    itemId
  ) => {
    const confirmed = window.confirm(
      "Delete this saved content?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(itemId);
      setMessage("");

      await deleteSavedContent(itemId);

      setSavedContents((current) =>
        current.filter(
          (item) =>
            (item.id || item._id) !==
            itemId
        )
      );
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to delete saved content."
      );
    } finally {
      setDeletingId("");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle
            size={24}
            className="animate-spin"
          />

          <span className="font-semibold">
            Loading saved content...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans relative">
      <div className="absolute left-1/2 top-0 h-96 w-[800px] -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-800"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700 font-sans">
                Business Library
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                Saved content
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600">
                Search, copy and manage your saved posts, ads, SEO content and customer replies.
              </p>
            </div>

            <div className="rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-700">
                Total saved
              </p>

              <p className="mt-1 text-2xl font-extrabold text-zinc-900">
                {savedContents.length}
              </p>
            </div>
          </div>
        </header>

        {message && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {message}
          </div>
        )}

        <section className="mb-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_260px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search saved content..."
                className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <select
              value={selectedType}
              onChange={(event) =>
                setSelectedType(
                  event.target.value
                )
              }
              className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            >
              {contentTypes.map(
                (type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                )
              )}
            </select>
          </div>
        </section>

        {filteredContents.length >
        0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredContents.map(
              (item) => {
                const itemId =
                  item.id || item._id;

                const isCopied =
                  copiedId === itemId;

                const isDeleting =
                  deletingId === itemId;

                return (
                  <article
                    key={itemId}
                    className="flex min-h-[310px] flex-col rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                        <FileText
                          size={21}
                        />
                      </div>

                      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold capitalize text-violet-700 border border-violet-100">
                        {formatContentType(
                          item.type
                        )}
                      </span>
                    </div>

                    <h2 className="mt-5 line-clamp-2 text-lg font-bold text-zinc-900">
                      {item.title ||
                        formatContentType(
                          item.type
                        )}
                    </h2>

                    <p className="mt-3 line-clamp-6 whitespace-pre-wrap text-sm leading-7 text-zinc-600">
                      {item.content ||
                        "No content available."}
                    </p>

                    <div className="mt-auto pt-5">
                      <p className="mb-4 text-xs text-zinc-400 font-medium">
                        {formatDate(
                          item.createdAt
                        )}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              item
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <Check
                                size={
                                  17
                                }
                              />
                              Copied
                            </>
                          ) : (
                            <>
                              <Clipboard
                                size={
                                  17
                                }
                              />
                              Copy
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={
                            isDeleting
                          }
                          onClick={() =>
                            handleDelete(
                              itemId
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <LoaderCircle
                              size={
                                17
                              }
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={
                                17
                              }
                            />
                          )}

                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Bookmark size={29} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-zinc-900">
              No saved content found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-zinc-500">
              Generate business content and save it. Your saved content will appear here.
            </p>

            <Link
              href="/business/post-generator"
              className="mt-6 inline-flex rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-800"
            >
              Create business content
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}