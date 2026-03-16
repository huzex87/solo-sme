"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users,
    UserPlus,
    Shield,
    Mail,
    Clock,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Trash2,
    ShieldCheck,
    UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaffService, StaffMember } from "@/services/staffService";
import { toast } from "sonner";

interface StaffManagementPanelProps {
    tenantId: string;
}

export function StaffManagementPanel({ tenantId }: StaffManagementPanelProps) {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<StaffMember['role']>("staff");
    const [inviting, setInviting] = useState(false);

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            const data = await StaffService.getStaff(tenantId);
            setStaff(data);
        } catch (e) {
            toast.error("Failed to load staff directory");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;
        setInviting(true);
        try {
            const token = await StaffService.inviteStaff(tenantId, inviteEmail, inviteRole);
            if (token) {
                toast.success(`Invite sent to ${inviteEmail}`);
                setInviteEmail("");
                fetchStaff();
            }
        } catch (e) {
            toast.error("Invitation failed");
        } finally {
            setInviting(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const nextActive = currentStatus !== 'active';
        await StaffService.toggleStatus(id, nextActive);
        toast.success(`Staff member ${nextActive ? 'activated' : 'deactivated'}`);
        fetchStaff();
    };

    return (
        <div className="space-y-10 animate-entrance">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight font-display">Staff Directory</h3>
                    <p className="text-sm text-slate-500 font-medium">Manage permissions and onboard your high-performance business team.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        {staff.filter(s => s.status === 'active').length} Active Members
                    </span>
                </div>
            </div>

            {/* Quick Invite Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <UserPlus size={18} className="text-primary" />
                            <h4 className="text-sm font-bold text-slate-900">Onboard New Staff</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed pr-4">
                            Invite members via email and assign specialized roles like Agent for support or Manager for operations.
                        </p>
                    </div>

                    <form onSubmit={handleInvite} className="flex-1 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="staff@business.com"
                                className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all outline-none"
                            />
                        </div>
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as StaffMember['role'])}
                            className="h-14 px-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-primary transition-all cursor-pointer"
                        >
                            <option value="staff">Basic Staff</option>
                            <option value="manager">Manager</option>
                            <option value="agent">Support Agent</option>
                            <option value="analyst">Analyst</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button
                            type="submit"
                            disabled={inviting || !inviteEmail}
                            className="h-14 px-8 bg-slate-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-slate-950/10 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {inviting ? <Clock className="animate-spin" size={16} /> : "Send Invite"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-[32px] border border-slate-100" />
                    ))
                ) : (
                    staff.map((member) => (
                        <div key={member.id} className="group relative bg-white border border-slate-100 rounded-[32px] p-6 shadow-premium hover:shadow-2xl transition-all duration-500 overflow-hidden">
                            {/* Role Badge Overlay */}
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Shield size={64} />
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg font-display uppercase",
                                        member.status === 'active' ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                                    )}>
                                        {member.name?.[0] || member.email?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-extrabold text-slate-900 truncate tracking-tight">{member.name || 'Pending Invite'}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter">{member.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Access Level</span>
                                        <span className="text-xs font-bold text-slate-700 capitalize flex items-center gap-1.5 mt-0.5">
                                            <ShieldCheck size={14} className="text-primary" />
                                            {member.role}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Status</span>
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase mt-1",
                                            member.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {member.status === 'active' ? <UserCheck size={10} /> : <Clock size={10} />}
                                            {member.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <button
                                        onClick={() => toggleStatus(member.id, member.status)}
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                                    >
                                        {member.status === 'active' ? "Deactivate" : "Activate"}
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <button className="text-slate-300 hover:text-slate-950 transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Empty State */}
            {!loading && staff.length === 0 && (
                <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center mx-auto">
                        <Users size={40} className="text-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-black text-slate-900 font-display">Solo Operations</h4>
                        <p className="text-xs font-medium text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                            You are currently operating solo. Invite your first staff member to scale your business.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
