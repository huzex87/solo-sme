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
            <div className={styles.loadingContainer}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
                <p>Decrypting secure activity logs...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    <ArrowLeft size={16} />
                    Back to Analytics
                </button>
                <div className={styles.headerTitle}>
                    <Shield size={24} color="var(--accent-primary)" />
                    <div>
                        <h1>Security Audit Explorer</h1>
                        <p>High-fidelity visibility into platform-wide business operations.</p>
                    </div>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search logs by action or entity..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterWrapper}>
                    <Filter size={16} />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="ALL">All Categories</option>
                        <option value="PRODUCT">Products</option>
                        <option value="AUTH">Authentication</option>
                        <option value="ORDER">Orders</option>
                        <option value="SETTINGS">Settings</option>
                    </select>
                </div>
            </div>

            <div className={styles.logGrid}>
                {filteredLogs.length === 0 ? (
                    <div className={styles.emptyLogs}>
                        <Activity size={48} />
                        <h3>No activity matched your search</h3>
                        <p>Try adjusting your search terms or filters to find specific events.</p>
                    </div>
                ) : (
                    filteredLogs.map(log => (
                        <div key={log.id} className={styles.logCard}>
                            <div className={styles.logHeader}>
                                <div className={`${styles.entityBadge} ${styles[log.entity_type.toLowerCase()] || ''}`}>
                                    {log.entity_type.toUpperCase()}
                                </div>
                                <span className={styles.logTime}>
                                    <Clock size={12} />
                                    {new Date(log.created_at).toLocaleString()}
                                </span>
                            </div>

                            <h3 className={styles.logAction}>{formatAction(log.action)}</h3>

                            <div className={styles.logMeta}>
                                <div className={styles.metaItem}>
                                    <User size={14} />
                                    <span>{log.user_id || 'System'}</span>
                                </div>
                            </div>

                            {(log.old_data || log.new_data) && (
                                <div className={styles.dataPreview}>
                                    {log.old_data && (
                                        <div className={styles.dataNode}>
                                            <label>Previous</label>
                                            <pre>{JSON.stringify(log.old_data, null, 2)}</pre>
                                        </div>
                                    )}
                                    {log.new_data && (
                                        <div className={styles.dataNode}>
                                            <label>Current</label>
                                            <pre>{JSON.stringify(log.new_data, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            {log.ip_address && (
                                <div className={styles.ipBadge}>
                                    Origin: {log.ip_address}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
