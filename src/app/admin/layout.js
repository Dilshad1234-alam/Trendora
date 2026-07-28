"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth.api";
import { Activity } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user || user.role !== "admin") {
          router.push("/login");
        } else {
          setUser(user);
        }
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Activity className="animate-spin text-violet-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 font-sans text-zinc-900 selection:bg-violet-500/30">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar setIsSidebarOpen={setIsSidebarOpen} user={user} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
