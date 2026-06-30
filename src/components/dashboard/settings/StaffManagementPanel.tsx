"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, UserPlus, Shield, Mail, Clock, CheckCircle2, XCircle,
    MoreVertical, Trash2, ShieldCheck, UserCheck, Truck, Wallet,
    BarChart3, Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaffService, StaffMember } from "@/services/staffService";
import { toast } from "sonner";

interface StaffManagementPanelProps {
    tenantId: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
    owner: { label: "Owner", icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
    admin: { label: "Admin", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
    manager: { label: "Manager", icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
    cashier: { label: "Cashier", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
    dispatcher: { label: "Dispatcher", icon: Truck, color: "text-rose-600", bg: "bg-rose-50" },
    analyst: { label: "Analyst", icon: BarChart3, color: "text-cyan-600", bg: "bg-cyan-50" },
    staff: { label: "Staff", icon: Users, color: "text-slate-600", bg: "bg-slate-50" }
};

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
            toast.error("Failed to load staff");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

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
            } else {
                toast.error("Invitation failed. Database schema might need migration execution.");
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
        toast.success(`Staff ${nextActive ? 'activated' : 'deactivated'}`);
        fetchStaff();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Team</h3>
                    <p className="text-sm text-slate-500">Manage staff access and roles.</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-600">
                        {staff.filter(s => s.status === 'active').length} active
                    </span>
                </div>
            </div>

            {/* Invite */}
            <form onSubmit={handleInvite} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                    <UserPlus size={15} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Invite Staff</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="staff@business.com"
                            className="w-full h-10 bg-white border border-slate-200 rounded-lg pl-9 pr-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all outline-none placeholder-slate-300"
                        />
                    </div>
                    <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as StaffMember['role'])}
                        className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-primary transition-all cursor-pointer"
                    >
                        <option value="staff">Staff</option>
                        <option value="cashier">Cashier</option>
                        <option value="dispatcher">Dispatcher</option>
                        <option value="manager">Manager</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button
                        type="submit"
                        disabled={inviting || !inviteEmail}
                        className="h-10 px-5 bg-slate-950 text-white rounded-lg text-sm font-medium hover:bg-primary transition-all disabled:opacity-50 shrink-0"
                    >
                        {inviting ? <Clock className="animate-spin mx-auto" size={14} /> : "Invite"}
                    </button>
                </div>
            </form>

            {/* Staff Grid */}
            <div className="space-y-2">
                {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-xl" />
                    ))
                ) : staff.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Users size={28} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No staff members yet</p>
                        <p className="text-xs text-slate-400 mt-1">Invite your first team member above.</p>
                    </div>
                ) : (
                    staff.map((member) => {
                        const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.staff;
                        const Icon = roleConfig.icon;

                        return (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm uppercase shrink-0",
                                        member.status === 'active' ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                                    )}>
                                        {member.name?.[0] || member.email?.[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{member.name || 'Pending invite'}</p>
                                        <p className="text-xs text-slate-400 truncate">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1", roleConfig.bg, roleConfig.color)}>
                                        <Icon size={10} />
                                        {roleConfig.label}
                                    </div>
                                    <div className={cn("w-1.5 h-1.5 rounded-full", member.status === 'active' ? "bg-emerald-500" : "bg-slate-300")} />
                                    <button
                                        onClick={() => toggleStatus(member.id, member.status)}
                                        className="text-xs text-slate-400 hover:text-primary transition-colors"
                                    >
                                        {member.status === 'active' ? "Deactivate" : "Activate"}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
