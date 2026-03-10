"use client";

import { useState, useEffect } from "react";
import {
    Shield,
    Search,
    Filter,
    Eye,
    ChevronRight,
    Lock,
    Terminal,
    Activity,
    Database,
    Fingerprint,
    ArrowLeft
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const AUDIT_LOGS = [
    { id: 'log_1', type: 'SECURITY', event: 'Unauthorized Access Blocked', user: 'System Sentinel', timestamp: '2026-03-10T14:45:21Z', status: 'CRITICAL', system: 'AuthEngine/v4' },
    { id: 'log_2', type: 'ADMIN', event: 'Sovereign Role Escalation', user: 'huzex@institutional.io', timestamp: '2026-03-10T12:30:00Z', status: 'AUDIT', system: 'SME-Core' },
    { id: 'log_3', type: 'FINANCE', event: 'Institutional Payout Executed', user: 'TreasuryBot', timestamp: '2026-03-10T10:15:45Z', status: 'SUCCESS', system: 'Ledger/P1' },
    { id: 'log_4', type: 'SCHEMA', event: 'Supabase RLS Hardening', user: 'System Architect', timestamp: '2026-03-09T22:30:12Z', status: 'SYSTEM', system: 'Database/Node.01' },
];

export default function AuditPage() {
    const { tenant } = useTenant();
    const router = useRouter();
    const [logs, setLogs] = useState(AUDIT_LOGS);
    const [loading, setLoading] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Fingerprint size={24} className="text-emerald-500 animate-pulse" />
                    </div>
                </div>
                <p className="text-emerald-500/60 font-mono text-sm tracking-widest uppercase animate-pulse">Scanning infrastructure logs...</p>
            </div>
        );
    }

    return (
        <div className="animate-entrance space-y-8 pb-12">
            {/* Security Header */}
            <div className="dh rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <button
                            className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4 hover:text-white transition-colors"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft size={14} /> Back to Performance
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="beta-chip px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                <Shield size={10} /> SOVEREIGN SECURITY
                            </span>
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white mb-1">Audit Explorer</h1>
                        <p className="text-white/40 text-sm font-medium">Real-time telemetry and immutable operational trails.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-inner">
                            <div className="relative px-3 py-2 flex items-center gap-2 text-white/40 group focus-within:text-white transition-colors">
                                <Search size={14} />
                                <input
                                    placeholder="Filter by SID, UID, or Event Type..."
                                    className="bg-transparent border-none outline-none text-xs font-mono font-bold w-48 placeholder:text-white/20"
                                />
                            </div>
                            <div className="w-[1px] h-4 bg-white/10" />
                            <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition-all text-white/40 hover:text-white">
                                <Filter size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sovereign Records Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-3">
                    {logs.map((log) => (
                        <div
                            key={log.id}
                            onClick={() => setSelectedEntry(log)}
                            className={cn(
                                "crystalCard group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                                selectedEntry?.id === log.id ? "bg-white/5 border-primary shadow-lg" : "border-border/50 hover:border-border hover:translate-x-1"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110",
                                    log.status === 'CRITICAL' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                        log.status === 'SUCCESS' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                            "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                )}>
                                    {log.type === 'SECURITY' ? <Lock size={18} /> :
                                        log.type === 'ADMIN' ? <Fingerprint size={18} /> :
                                            log.type === 'FINANCE' ? <Activity size={18} /> : <Database size={18} />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-ink">{log.event}</h4>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase tracking-tighter">
                                        <span className="font-mono text-primary/80">{log.system}</span>
                                        <span>•</span>
                                        <span>{log.user}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex flex-col items-end">
                                    <p className="text-[10px] font-black font-mono text-ink/80">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                    <p className="text-[9px] font-bold text-ghost">{new Date(log.timestamp).toLocaleDateString()}</p>
                                </div>
                                <ChevronRight size={14} className="text-ghost group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-1">
                    {selectedEntry ? (
                        <div className="crystalCard sticky top-6 rounded-3xl border border-primary/20 overflow-hidden shadow-2xl animate-entrance">
                            <div className="bg-primary/5 p-6 border-b border-border/50 flex items-center justify-between">
                                <h3 className="font-black text-ink flex items-center gap-2">
                                    <Terminal size={16} className="text-primary" /> Entry Details
                                </h3>
                                <div className="beta-chip bg-primary/10 text-primary border-primary/20 px-2 py-1 text-[9px] font-black uppercase">Active SID</div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black text-ghost uppercase tracking-widest">Global Timestamp</label>
                                        <div className="font-mono text-xs text-ink/80 bg-surface/50 p-2 rounded-lg border border-border/50">{selectedEntry.timestamp}</div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-black text-ghost uppercase tracking-widest">Sovereign Context</label>
                                        <div className="font-mono text-xs text-ink/80 bg-surface/50 p-2 rounded-lg border border-border/50">{selectedEntry.user}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-ghost uppercase tracking-widest">Raw Payload Shimmer</label>
                                    <div className="bg-[#0D1B24] p-4 rounded-xl border border-white/5 relative group overflow-hidden">
                                        <pre className="text-[10px] font-mono text-emerald-400/80 leading-relaxed">
                                            {`{
  "sid": "${selectedEntry.id}",
  "type": "${selectedEntry.type}",
  "origin": "SOLO-HQ",
  "secure": true
}`}
                                        </pre>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity" />
                                    </div>
                                </div>

                                <button className="w-full py-3 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95">
                                    Mobilize Full Report
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="crystalCard sticky top-6 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center p-12 text-center opacity-60">
                            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                                <Eye size={32} className="text-ghost" />
                            </div>
                            <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">Select an entry to view deep telemetry</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
