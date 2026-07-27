"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, LoaderCircle, Plus, Mail, CheckCircle2, Shield } from "lucide-react";
import { getAgencyTeam, addAgencyTeamMember } from "@/services/agency-tools.api";

export default function AgencyTeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    memberName: "",
    memberEmail: "",
    role: "editor",
  });

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await getAgencyTeam();
      setTeam(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      setError("");
      await addAgencyTeamMember(formData);
      await fetchTeam();
      setShowAddModal(false);
      setFormData({ memberName: "", memberEmail: "", role: "editor" });
    } catch (err) {
      setError(err.message || "Failed to invite member");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle size={24} className="animate-spin" />
          <span className="font-medium">Loading team...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[800px] max-w-full -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/agency/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-2">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-zinc-950">
              Team Settings
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Manage who has access to your agency workspace.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800"
          >
            <Plus size={18} /> Invite Member
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          {team.length === 0 ? (
            <div className="p-10 text-center">
              <Users size={40} className="mx-auto mb-4 text-violet-200" />
              <h3 className="text-lg font-bold text-zinc-900">No team members</h3>
              <p className="mt-1 text-sm text-zinc-500">Invite your first team member to collaborate.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200">
              {team.map((member) => (
                <div key={member._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-zinc-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-xl uppercase">
                      {member.memberName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">{member.memberName}</h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Mail size={14} /> {member.memberEmail}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-semibold capitalize text-zinc-700">
                      <Shield size={14} className="text-zinc-400" /> {member.role}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${member.status === 'invited' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-zinc-900 mb-1">Invite Team Member</h2>
            <p className="text-sm text-zinc-500 mb-6">They will receive an email invitation to join.</p>
            
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</label>
                <input required name="memberName" value={formData.memberName} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="John Doe" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Email Address</label>
                <input required type="email" name="memberEmail" value={formData.memberEmail} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="john@example.com" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white appearance-none">
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-700 hover:bg-zinc-200 transition">Cancel</button>
                <button type="submit" disabled={adding} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 py-3 font-semibold text-white hover:bg-violet-800 transition disabled:opacity-50">
                  {adding ? <LoaderCircle size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
