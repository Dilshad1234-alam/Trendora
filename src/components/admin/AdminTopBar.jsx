"use client";

import { useState } from "react";
import { Search, Bell, Sun, Moon, Menu, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/services/auth.api";

export default function AdminTopBar({ setIsSidebarOpen, user }) {
  const router = useRouter();
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    // Theme logic can be extended here
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-200 bg-white/70 px-4 backdrop-blur-xl sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-zinc-700 lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="h-6 w-px bg-zinc-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-zinc-400 ml-2"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-zinc-900 placeholder:text-zinc-400 focus:ring-0 sm:text-sm bg-transparent"
            placeholder="Global search..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-zinc-400 hover:text-zinc-500 transition-colors"
            onClick={toggleTheme}
          >
            <span className="sr-only">Toggle theme</span>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          
          <button type="button" className="-m-2.5 p-2.5 text-zinc-400 hover:text-zinc-500 relative">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-zinc-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative group">
            <button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold border border-violet-200 uppercase">
                {user?.fullname?.charAt(0) || "A"}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-zinc-900" aria-hidden="true">
                  {user?.fullname || "Admin User"}
                </span>
              </span>
            </button>
            
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block border border-zinc-100 transition-all">
              <div className="px-4 py-2 border-b border-zinc-100">
                <p className="text-sm font-medium text-zinc-900 truncate">{user?.email}</p>
                <p className="text-xs text-zinc-500 capitalize">{user?.role} Role</p>
              </div>
              <button
                onClick={() => router.push("/admin/settings")}
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
              >
                <Settings size={16} className="text-zinc-400" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
