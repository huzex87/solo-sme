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
    UserCheck,
    Truck,
    Wallet,
    BarChart3,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StaffService, StaffMember } from "@/services/staffService";
import { toast } from "sonner";

interface StaffManagementPanelProps {
    tenantId: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    owner: { label: "Business Owner", icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
    admin: { label: "System Admin", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
    manager: { label: "Operations Manager", icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
    cashier: { label: "Retail Cashier", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
    dispatcher: { label: "Logistics Dispatcher", icon: Truck, color: "text-rose-600", bg: "bg-rose-50" },
    analyst: { label: "Business Analyst", icon: BarChart3, color: "text-cyan-600", bg: "bg-cyan-50" },
    staff: { label: "Staff Member", icon: Users, color: "text-slate-600", bg: "bg-slate-50" }
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
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight font-display italic">Staff Intelligence</h3>
                    <p className="text-sm text-slate-500 font-medium">Orchestrate your high-performance team with institutional-grade RBAC.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        {staff.filter(s => s.status === 'active').length} Active Members
                    </span>
                </div>
            </div>

            {/* Quick Invite Card */}
            <div className="relative group overflow-hidden bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium transition-all hover:shadow-2xl">
                {/* Decorative Radiant Background */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-colors" />

                <div className="relative flex flex-col lg:flex-row gap-8 items-center">
                    <div className="lg:w-1/3 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <UserPlus size={18} />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Onboard Staff</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed pr-4">
                            Deploy granular access levels. Select a role to automatically provision world-class permissions.
                        </p>
                    </div>

                    <form onSubmit={handleInvite} className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                        <div className="flex-1 relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="staff@business.com"
                                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/40 transition-all outline-none"
                            />
                        </div>
                        <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as StaffMember['role'])}
                            className="h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-900 outline-none focus:border-primary focus:bg-white transition-all cursor-pointer uppercase tracking-widest"
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
                            className="h-14 px-8 bg-slate-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-950/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {inviting ? <Clock className="animate-spin mx-auto" size={16} /> : "Provision"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[32px] border border-slate-100" />
                    ))
                ) : (
                    staff.map((member) => {
                        const config = ROLE_CONFIG[member.role] || ROLE_CONFIG.staff;
                        const Icon = config.icon;

                        return (
                            <div key={member.id} className="group relative bg-white border border-slate-100 rounded-[32px] p-8 shadow-premium hover:shadow-2xl transition-all duration-500">
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl font-display uppercase shadow-inner",
                                            member.status === 'active' ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {member.name?.[0] || member.email?.[0]}
                                        </div>
                                        <div className={cn("px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", config.bg, config.color)}>
                                            <Icon size={12} />
                                            {config.label}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-slate-900 truncate tracking-tight text-lg">{member.name || 'Empowering Invite...'}</h4>
                                        <p className="text-xs font-bold text-slate-400 truncate uppercase tracking-tighter">{member.email}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Permissions</span>
                                            <span className="text-[10px] font-bold text-slate-600">{member.permissions?.length || 0} Modules Active</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {member.permissions?.slice(0, 3).map((p, i) => (
                                                <div key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                                                    {p.split(':')[0]}
                                                </div>
                                            ))}
                                            {(member.permissions?.length || 0) > 3 && (
                                                <div className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    +{(member.permissions?.length || 0) - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full", member.status === 'active' ? "bg-emerald-500" : "bg-slate-300")} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.status}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => toggleStatus(member.id, member.status)}
                                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                                            >
                                                {member.status === 'active' ? "Deactivate" : "Activate"}
                                            </button>
                                            <button className="text-slate-200 hover:text-slate-950 transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Empty State */}
            {!loading && staff.length === 0 && (
                <div className="py-20 text-center space-y-6 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                    <div className="w-24 h-24 rounded-[32px] bg-white shadow-premium flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-500">
                        <Users size={48} className="text-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-900 font-display">Solo Standard Operations</h4>
                        <p className="text-sm font-medium text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                            You are currently operating in Solo Mode. Onboard specialized staff to unlock institutional velocity.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
