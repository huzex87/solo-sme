'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { AuditService, AuditLog } from '@/services/auditService';
import { ShieldCheck, Users, Activity, Clock, Search, User, Database } from 'lucide-react';
import styles from './admin.module.css';

export default function AdminPage() {
    const { tenantId } = useTenant();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    useEffect(() => {
        async function fetchLogs() {
            if (!tenantId) return;
            const data = await AuditService.getRecentLogs(tenantId);
            setLogs(data);
        }
        fetchLogs();
    }, [tenantId]);

    const getActionClass = (action: string) => {
        if (action.includes('LOGIN')) return styles.action_login;
        if (action.includes('UPDATE')) return styles.action_update;
        if (action.includes('DELETE')) return styles.action_delete;
        return '';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Admin Console</h1>
                    <p className={styles.subtitle}>System health, security audits, and operational oversight.</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-outline">System Status</button>
                    <button className="btn btn-primary">Security Settings</button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.iconBox} style={{ background: '#E0F2FE', color: '#0369A1' }}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Active Staff</h4>
                        <div className={styles.statValue}>4</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.iconBox} style={{ background: '#DCFCE7', color: '#166534' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Security Score</h4>
                        <div className={styles.statValue}>98%</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.iconBox} style={{ background: '#FEF9C3', color: '#854D0E' }}>
                        <Activity size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>API Uptime</h4>
                        <div className={styles.statValue}>99.9%</div>
                    </div>
                </div>
            </div>

            <div className={styles.logSection}>
                <div className={styles.logHeader}>
                    <div className="flex items-center gap-2">
                        <Database size={20} color="var(--primary)" />
                        <h3>Operational Audit Logs</h3>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input type="text" className="input-field py-2 pl-9 text-xs" placeholder="Search logs..." />
                        </div>
                    </div>
                </div>

                <div className={styles.logList}>
                    {logs.map(log => (
                        <div key={log.id} className={styles.logItem}>
                            <div className={`${styles.actionBadge} ${getActionClass(log.action)}`}>
                                {log.action}
                            </div>
                            <div className={styles.logMeta}>
                                <div className={styles.logDesc}>
                                    {log.entity_type} {log.entity_id} was modified.
                                </div>
                                <div className={styles.logTime}>
                                    <Clock size={10} style={{ display: 'inline', marginRight: '4px' }} />
                                    {new Date(log.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div className={styles.userBadge}>
                                <User size={14} />
                                {log.actor_id}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
