"use client";

import { X, User, Briefcase, CreditCard, Activity, MapPin, Mail, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";

export default function UserDrawer({ isOpen, onClose, user }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md transform overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 sm:max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900">User Profile</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {user ? (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-2xl font-bold text-violet-700 uppercase shadow-inner border border-violet-200">
                {user.fullname?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-zinc-900">{user.fullname}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                  <Mail size={14} />
                  <span>{user.email}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 capitalize border border-zinc-200">
                    <Briefcase size={12} className="mr-1" />
                    {user.workspace || "No Workspace"}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize border ${
                    user.plan === "free" ? "bg-zinc-100 text-zinc-700 border-zinc-200" :
                    user.plan === "agency" ? "bg-amber-100 text-amber-700 border-amber-200" :
                    "bg-violet-100 text-violet-700 border-violet-200"
                  }`}>
                    <Shield size={12} className="mr-1" />
                    {user.plan || "Free"}
                  </span>
                  {user.suspended && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
                      Suspended
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* General Info */}
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">Details</h4>
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Joined</span>
                  <span className="font-medium text-zinc-900">
                    {user.createdAt ? format(new Date(user.createdAt), "PPP") : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Last Login</span>
                  <span className="font-medium text-zinc-900">
                    {user.lastLogin ? format(new Date(user.lastLogin), "PPP p") : "Never"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Country</span>
                  <span className="font-medium text-zinc-900 flex items-center gap-1">
                    <MapPin size={14} className="text-zinc-400" />
                    {user.country || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Trial Status</span>
                  <span className="font-medium text-zinc-900">
                    {user.trialExpired ? "Expired" : user.trialEndsAt ? "Active" : "None"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm">
                  <CreditCard size={16} />
                  Manage Plan
                </button>
                <button className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm">
                  <Calendar size={16} />
                  Reset Trial
                </button>
                <button className={`col-span-2 flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all shadow-sm ${
                  user.suspended 
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
                    : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                }`}>
                  <Shield size={16} />
                  {user.suspended ? "Activate User" : "Suspend User"}
                </button>
              </div>
            </div>
            
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center">
            <Activity className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        )}
      </div>
    </>
  );
}
