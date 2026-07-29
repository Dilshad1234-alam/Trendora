"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, LogOut, CheckSquare, FileText, User } from "lucide-react";
import { logoutUser } from "@/services/auth.api";

export default function AgencyHeader({ user, notifications, unreadCount, onMarkAllRead, onMarkRead }) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/agency/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Global Search */}
      <div className="flex flex-1">
        <form onSubmit={handleSearch} className="flex w-full max-w-md items-center relative">
          <Search size={18} className="absolute left-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search clients, projects, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-violet-700 transition"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
                <h3 className="font-bold text-zinc-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={onMarkAllRead} className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar flex flex-col">
                {!notifications || notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-zinc-500">No new notifications.</div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif._id} className={`flex gap-3 p-4 border-b border-zinc-100 transition ${notif.read ? 'bg-white opacity-70' : 'bg-violet-50/30'}`}>
                      <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notif.read ? 'bg-zinc-100 text-zinc-500' : 'bg-violet-100 text-violet-700'}`}>
                        {notif.type.includes('task') ? <CheckSquare size={14} /> : notif.type.includes('content') ? <FileText size={14} /> : <Bell size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-zinc-900 mb-0.5">{notif.title}</p>
                        <p className="text-[11px] text-zinc-600 leading-snug mb-2">{notif.message}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-zinc-400 font-medium">{new Date(notif.createdAt).toLocaleDateString()}</span>
                          {!notif.read && (
                            <button onClick={(e) => onMarkRead(notif._id, e)} className="text-[10px] font-bold text-violet-600 hover:text-violet-800">
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1 pr-3 hover:bg-zinc-50 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-700 text-xs font-bold text-white">
              {user?.name?.charAt(0) || "A"}
            </div>
            <span className="text-sm font-semibold text-zinc-700 hidden sm:block">
              {user?.name?.split(" ")[0] || "Agency"}
            </span>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
              <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                <p className="text-sm font-bold text-zinc-900">{user?.name || "Agency Admin"}</p>
                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <Link href="/agency/settings" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition">
                  <User size={16} /> Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition w-full text-left"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
