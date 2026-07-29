"use client";

import { useState, useEffect } from "react";
import AgencySidebar from "@/components/agency/AgencySidebar";
import AgencyHeader from "@/components/agency/AgencyHeader";
import AgencyAIAssistant from "@/components/agency/AgencyAIAssistant";
import { getAgencyDashboard } from "@/services/agency.api";
import { getAgencyNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/agency-tools.api";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function AgencyWorkspaceLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const [dashRes, notifRes] = await Promise.allSettled([
          getAgencyDashboard(),
          getAgencyNotifications()
        ]);

        if (dashRes.status === "fulfilled" && dashRes.value?.data) {
          setUser(dashRes.value.data.user);
        } else {
          throw dashRes.reason || new Error("Unauthorized");
        }

        if (notifRes.status === "fulfilled" && notifRes.value?.data) {
          setNotifications(notifRes.value.data);
          setUnreadCount(notifRes.value.unreadCount);
        }
      } catch (error) {
        if (error.code === "TRIAL_EXPIRED") {
          router.replace("/onboarding/select-plan?recommended=agency");
        } else {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadWorkspace();
  }, [router]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id, e) => {
    if (e) e.preventDefault();
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <LoaderCircle size={28} className="animate-spin text-violet-700" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <AgencySidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AgencyHeader 
          user={user} 
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
          onMarkRead={handleMarkRead}
        />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
      <AgencyAIAssistant />
    </div>
  );
}
