'use client';

import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Shield, Clock, User, Activity, AlertTriangle, Search, Filter } from 'lucide-react';
import { AuditService, AuditLog } from '@/services/auditService';
import { useTenant } from '@/context/TenantContext';
import { useRouter } from 'next/navigation';
import styles from './audit.module.css';

export default function AuditPage() {
    const { tenantId } = useTenant();
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        async function fetchLogs() {
            if (!tenantId) return;
            try {
                setLoading(true);
                const data = await AuditService.getRecentLogs(tenantId, 100);
                setLogs(data);
            } catch (err) {
                console.error('Failed to fetch audit logs:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, [tenantId]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entity_type.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filter === 'ALL' || log.entity_type.toUpperCase() === filter;

        return matchesSearch && matchesFilter;
    });

    const formatAction = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-32 gap-6">
                <Loader2 className="animate-spin" size={48} color="var(--blue)" />
                <p className="text-t3 italic font-medium">Decrypting secure activity logs...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full -mt-[clamp(12px,3vw,32px)] -mx-[clamp(12px,3vw,32px)] overflow-x-hidden">
            {/* ── High-Fidelity Header ── */}
            <div className="dh">
                <button
                    className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-6 hover:text-white transition-colors"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={14} /> Back to Performance
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-xl">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none mb-1">
                            Security & Integrity
                        </p>
                        <h2 className="text-white text-lg font-extrabold tracking-tight font-display m-0">
                            Audit Trail Explorer
                        </h2>
                    </div>
                </div>
            </div>

            <div className="px-5 -mt-6 relative z-10 pb-32">
                {/* ── Filter Controls ── */}
                <div className="bg-white p-4 rounded-[28px] border border-border shadow-sh-sm mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative flex items-center">
                        <Search className="absolute left-4 text-t4" size={16} />
                        <input
                            type="text"
                            placeholder="Search activity..."
                            className="w-full bg-surface/50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue/10 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-surface/50 px-4 py-2 rounded-2xl border border-border/50">
                        <Filter size={14} className="text-t4" />
                        <select
                            className="bg-transparent border-none text-[11px] font-bold uppercase tracking-wider focus:ring-0 cursor-pointer"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="ALL">All Events</option>
                            <option value="PRODUCT">Products</option>
                            <option value="AUTH">Security</option>
                            <option value="ORDER">Commercial</option>
                            <option value="SETTINGS">System</option>
                        </select>
                    </div>
                </div>

                {/* ── Logs List ── */}
                <div className="flex flex-col gap-4">
                    {filteredLogs.length === 0 ? (
                        <div className="bg-white rounded-[32px] border border-border p-12 text-center flex flex-col items-center gap-4">
                            <Activity size={48} className="text-t4 opacity-20" />
                            <h3 className="text-t1 text-lg font-bold tracking-tight">No activity found</h3>
                            <p className="text-t4 text-sm max-w-xs">Adjust your filters or search terms to explore institutional logs.</p>
                        </div>
                    ) : (
                        filteredLogs.map(log => (
                            <div key={log.id} className="crystalCard p-6 rounded-[32px] group hover:scale-[1.01] transition-all duration-500">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue/10 text-blue shadow-glow-blue-sm">
                                            {log.entity_type}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-t4 text-[10px] font-bold">
                                            <Clock size={12} />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    {log.ip_address && (
                                        <div className="text-[9px] font-mono text-t4 opacity-40">
                                            Origin: {log.ip_address}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-t1 text-base font-extrabold tracking-tight mb-4 capitalize">
                                    {formatAction(log.action)}
                                </h3>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-2 bg-surface/50 px-3 py-1.5 rounded-xl border border-border/40">
                                        <User size={14} className="text-t4" />
                                        <span className="text-t2 text-[11px] font-bold tracking-tight">{log.user_id || 'System Engine'}</span>
                                    </div>
                                </div>

                                {(log.old_data || log.new_data) && (
                                    <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {log.old_data && (
                                            <div>
                                                <p className="text-t4 text-[9px] font-black uppercase tracking-widest mb-2">Previous State</p>
                                                <div className="bg-surface/30 rounded-2xl p-4 border border-border/20 backdrop-blur-sm overflow-hidden">
                                                    <pre className="text-[10px] font-mono text-t3 leading-relaxed max-h-40 overflow-y-auto">
                                                        {JSON.stringify(log.old_data, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                        {log.new_data && (
                                            <div>
                                                <p className="text-blue text-[9px] font-black uppercase tracking-widest mb-2">Current State</p>
                                                <div className="bg-blue/5 rounded-2xl p-4 border border-blue/10 backdrop-blur-sm overflow-hidden shadow-glow-blue-sm">
                                                    <pre className="text-[10px] font-mono text-blue/80 leading-relaxed max-h-40 overflow-y-auto font-bold">
                                                        {JSON.stringify(log.new_data, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
