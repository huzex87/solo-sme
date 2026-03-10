"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    User,
    Store,
    CreditCard,
    Bell,
    ChevronRight,
    Camera,
    Globe,
    ExternalLink,
    CheckCircle2,
    Copy,
    Zap,
    LogOut,
    Plus,
    Loader2,
    ArrowRight
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const SETTINGS_GROUPS = [
    { id: "account", label: "Account", icon: User },
    { id: "store", label: "Store Settings", icon: Store },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
    const { tenantId, tenantName, subdomain } = useTenant();
    const [isOnline, setIsOnline] = useState(true);
    const [tempSubdomain, setTempSubdomain] = useState(subdomain || "");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

    useEffect(() => {
        if (tenantName) {
            const base = tenantName.toLowerCase().replace(/[^a-z0-9]/g, "");
            // Suggestions without dashes or underscores per User Request 4
            setSuggestions([base, `${base}hub`, `the${base}`, `${base}ng`]);
        }
    }, [tenantName]);

    const handleSaveSubdomain = async (newSub: string) => {
        if (!tenantId || !newSub || newSub === subdomain) return;

        setSaveStatus("saving");
        try {
            const { error } = await supabase
                .from("tenants")
                .update({ subdomain: newSub })
                .eq("id", tenantId);

            if (error) throw error;
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (err) {
            console.error("Error saving subdomain:", err);
            setSaveStatus("error");
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-entrance pb-32">
            {/* ── High-Fidelity Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-t1 text-xl font-extrabold tracking-tight font-display m-0">Settings</h2>
                    <p className="text-t3 text-xs font-bold uppercase tracking-wider mt-1">Manage your business</p>
                </div>
                <button className="text-red text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    Logout <LogOut size={14} />
                </button>
            </div>

            {/* ── Profile Section ── */}
            <div className="flex flex-col items-center py-4">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue to-blue-dim border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                        <span className="text-white text-3xl font-black">{(tenantName || "S").charAt(0)}</span>
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-ink text-white border-2 border-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
                        <Camera size={14} />
                    </button>
                </div>
                <h3 className="text-t1 text-lg font-extrabold tracking-tight mt-4">Adeola Johnson</h3>
                <p className="text-t3 text-xs font-bold uppercase tracking-widest">{tenantName || "SOLO Merchant"}</p>
            </div>

            {/* ── Store Card (Wizard View) ── */}
            <div className="bg-white p-5 rounded-[32px] border border-border shadow-sh-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-dim text-blue flex items-center justify-center">
                            <Globe size={20} />
                        </div>
                        <div>
                            <h4 className="text-t1 text-[13px] font-extrabold tracking-tight">Store Subdomain</h4>
                            <p className="text-t3 text-[10px] font-bold uppercase tracking-widest">
                                {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : `solo.store/${subdomain || "yourstore"}`}
                            </p>
                        </div>
                    </div>
                    {saveStatus === "success" && <CheckCircle2 size={20} className="text-green" />}
                </div>

                {/* Subdomain Input with Auto-Save */}
                <div className="bg-surface rounded-2xl p-4">
                    <p className="text-t3 text-[10px] font-black uppercase tracking-widest mb-3">Custom Subdomain</p>
                    <div className="relative mb-4">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-t4 text-sm font-bold">solo.store/</span>
                        <input
                            type="text"
                            value={tempSubdomain}
                            onChange={(e) => {
                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
                                setTempSubdomain(val);
                            }}
                            onBlur={() => handleSaveSubdomain(tempSubdomain)}
                            className="w-full bg-white border border-border h-12 rounded-xl pl-[86px] pr-4 text-sm font-bold text-t1 outline-none focus:border-blue transition-colors"
                            placeholder="myshop"
                        />
                    </div>

                    <p className="text-t4 text-[9px] font-bold uppercase tracking-widest mb-2">Suggestions</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {suggestions.map(s => (
                            <button
                                key={s}
                                onClick={() => {
                                    setTempSubdomain(s);
                                    handleSaveSubdomain(s);
                                }}
                                className={cn(
                                    "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    tempSubdomain === s ? "bg-blue text-white shadow-lg shadow-blue/20" : "bg-white text-t2 border border-border"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Wizard Step: Take to WhatsApp next */}
                    <Link
                        href="/dashboard/whatsapp"
                        className="w-full bg-ink text-white h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest group shadow-sh-md"
                    >
                        Next: Setup WhatsApp AI <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* ── Settings Groups ── */}
            <div className="bg-white rounded-[32px] border border-border shadow-sh-sm overflow-hidden divide-y divide-border">
                {SETTINGS_GROUPS.map((group) => {
                    const Icon = group.icon;
                    return (
                        <Link
                            key={group.id}
                            href={`/dashboard/settings/${group.id}`}
                            className="flex items-center justify-between p-5 active:bg-surface transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-surface group-hover:bg-blue-dim group-hover:text-blue text-t4 transition-colors flex items-center justify-center">
                                    <Icon size={20} />
                                </div>
                                <span className="text-t1 text-sm font-extrabold tracking-tight">{group.label}</span>
                            </div>
                            <ChevronRight size={18} className="text-t4" />
                        </Link>
                    )
                })}
            </div>

            {/* ── Beta Footer community ── */}
            <div className="py-8 text-center">
                <div className="inline-flex items-center gap-2 bg-surface px-4 py-2 rounded-2xl border border-border border-dashed">
                    <Zap size={14} className="text-amber fill-amber" />
                    <span className="text-t3 text-[10px] font-black uppercase tracking-widest">Obsidian v3.0 Early Access</span>
                </div>
                <p className="text-t4 text-[9px] font-bold uppercase tracking-widest mt-4">
                    Product of SOLO SME · Build 0.9.1
                </p>
            </div>
        </div>
    );
}
