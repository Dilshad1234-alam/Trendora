"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Users, LoaderCircle, Plus, Mail, 
  CheckCircle2, Shield, MoreVertical, Ban, RefreshCw, X
} from "lucide-react";
import { 
  getAgencyTeam, 
  addAgencyTeamMember, 
  updateAgencyTeamMember,
  removeAgencyTeamMember
} from "@/services/agency-tools.api";

export default function AgencyTeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [adding, setAdding] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [invitationLink, setInvitationLink] = useState(null);
  const [copied, setCopied] = useState(false);

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
    // eslint-disable-next-line
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
      setInvitationLink(null);
      
      const res = await addAgencyTeamMember(formData);
      await fetchTeam();
      
      if (res.data?.invitationLink) {
        setInvitationLink(res.data.invitationLink);
      } else {
        setShowAddModal(false);
        setFormData({ memberName: "", memberEmail: "", role: "editor" });
      }
    } catch (err) {
      setError(err.message || "Failed to invite member");
    } finally {
      setAdding(false);
    }
  };

  const handleCopyLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleUpdateRole = async (newRole) => {
    if (!selectedMember || selectedMember.role === newRole) return;
    try {
      setProcessing(true);
      await updateAgencyTeamMember(selectedMember._id, { role: newRole });
      await fetchTeam();
      setShowEditModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedMember || selectedMember.status === newStatus) return;
    try {
      setProcessing(true);
      await updateAgencyTeamMember(selectedMember._id, { status: newStatus });
      await fetchTeam();
      setShowEditModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleResendInvite = async (member) => {
    try {
      setProcessing(true);
      const res = await addAgencyTeamMember({
        memberName: member.memberName,
        memberEmail: member.memberEmail,
        role: member.role
      });
      if (res.data?.invitationLink) {
        setInvitationLink(res.data.invitationLink);
        setShowAddModal(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember || !confirm("Are you sure you want to permanently remove this member?")) return;
    try {
      setProcessing(true);
      await removeAgencyTeamMember(selectedMember._id);
      await fetchTeam();
      setShowEditModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle size={24} className="animate-spin" />
          <span className="font-medium">Loading team...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/agency/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-3">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-200">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-950">
                  Team Settings
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  Manage roles, permissions, and invitations for your agency.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => { setInvitationLink(null); setShowAddModal(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800"
          >
            <Plus size={18} /> Invite Member
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          {team.length === 0 ? (
            <div className="p-10 text-center">
              <Users size={40} className="mx-auto mb-4 text-zinc-300" />
              <h3 className="text-lg font-bold text-zinc-900">No team members</h3>
              <p className="mt-1 text-sm text-zinc-500">Invite your first team member to collaborate.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {team.map((member) => (
                <div key={member._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-zinc-50/50 transition">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-xl uppercase shrink-0">
                      {member.memberName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900">{member.memberName}</h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Mail size={14} /> {member.memberEmail}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold capitalize text-zinc-700 shadow-sm">
                      <Shield size={14} className="text-zinc-400" /> {member.role}
                    </span>
                    
                    <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm ${
                      member.status === 'invited' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                      member.status === 'disabled' ? 'bg-zinc-100 text-zinc-500 border border-zinc-200' :
                      'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {member.status}
                    </span>

                    <button 
                      onClick={() => openEditModal(member)}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
                      title="Manage Member"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {member.status === 'invited' && (
                      <button 
                        onClick={() => handleResendInvite(member)}
                        className="rounded-lg p-2 text-violet-400 hover:bg-violet-50 hover:text-violet-700 transition"
                        title="Resend Invite"
                      >
                        <RefreshCw size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-zinc-900">Invite Team Member</h2>
              <button onClick={() => { setShowAddModal(false); setInvitationLink(null); }} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100">
                <X size={20} />
              </button>
            </div>
            
            {invitationLink ? (
              <div className="mt-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 mb-6">
                  <p className="font-semibold mb-2 flex items-center gap-2"><CheckCircle2 size={16}/> Invitation generated successfully!</p>
                  <p>In a production environment, this link would be emailed. For now, copy it below and send it to your team member.</p>
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  <input 
                    readOnly 
                    value={invitationLink}
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm font-mono text-zinc-600 outline-none"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="shrink-0 rounded-xl bg-violet-100 px-4 py-3 text-sm font-bold text-violet-700 hover:bg-violet-200 transition"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <button onClick={() => { setShowAddModal(false); setInvitationLink(null); }} className="w-full rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-700 hover:bg-zinc-200 transition">
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-zinc-500 mb-6">Send an invitation to join your agency workspace.</p>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</label>
                    <input required name="memberName" value={formData.memberName} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Email Address</label>
                    <input required type="email" name="memberEmail" value={formData.memberEmail} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10" placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Role</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 appearance-none">
                      <option value="admin">Admin (Manage team & clients)</option>
                      <option value="editor">Editor (Review & approve content)</option>
                      <option value="writer">Writer (Create & edit only)</option>
                      <option value="viewer">Viewer (Read only)</option>
                    </select>
                  </div>
                  
                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-700 hover:bg-zinc-200 transition">Cancel</button>
                    <button type="submit" disabled={adding} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 py-3 font-semibold text-white hover:bg-violet-800 transition disabled:opacity-50">
                      {adding ? <LoaderCircle size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Generate Invite
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Manage Member</h2>
              <button onClick={() => setShowEditModal(false)} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100">
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 border border-zinc-100">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold uppercase shrink-0">
                  {selectedMember.memberName.charAt(0)}
               </div>
               <div>
                 <p className="font-bold text-zinc-900 text-sm">{selectedMember.memberName}</p>
                 <p className="text-xs text-zinc-500">{selectedMember.memberEmail}</p>
               </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Change Role</label>
                <select 
                  value={selectedMember.role} 
                  onChange={(e) => handleUpdateRole(e.target.value)} 
                  disabled={processing || selectedMember.role === 'owner'}
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white appearance-none disabled:opacity-50"
                >
                  <option value="owner" disabled>Owner</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="writer">Writer</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              {selectedMember.role !== 'owner' && (
                <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100">
                  {selectedMember.status === 'active' ? (
                     <button 
                       onClick={() => handleUpdateStatus('disabled')}
                       disabled={processing}
                       className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition disabled:opacity-50"
                     >
                       <Ban size={16} /> Disable Account Access
                     </button>
                  ) : selectedMember.status === 'disabled' ? (
                    <button 
                       onClick={() => handleUpdateStatus('active')}
                       disabled={processing}
                       className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                     >
                       <CheckCircle2 size={16} /> Enable Account Access
                     </button>
                  ) : null}

                  <button 
                    onClick={handleRemoveMember}
                    disabled={processing}
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                  >
                    <X size={16} /> Remove Member Permanently
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
