'use client';

import { useEffect, useState } from 'react';
import { StaffService } from '@/services/staffService';
import { StaffMember } from '@/types';
import { useTenant } from '@/context/TenantContext';
import styles from './staff.module.css';
import { exportToCSV } from '@/utils/csvExport';

export default function StaffPage() {
    const { tenantId, isLoading: isTenantLoading } = useTenant();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isTenantLoading) return;
        if (!tenantId) {
            setLoading(false);
            return;
        }
        // The original instruction snippet had a duplicate !tenantId check,
        // which is removed here to maintain correct logic.
        // if (!tenantId) {
        //     setLoading(false);
        //     return;
        // }

        const fetchStaff = async () => {
            const data = await StaffService.getStaff(tenantId);
            setStaff(data);
            setLoading(false);
        };
        fetchStaff();
    }, [tenantId]);

    const handleExport = () => {
        exportToCSV(staff as unknown as Record<string, unknown>[], 'SOLO_Staff_List');
    };

    if (loading) return <div className="loading">Loading Team...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Staff Management</h1>
                    <p className={styles.subtitle}>Manage roles, permissions, and team access.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={handleExport}>
                        Export List
                    </button>
                    <button className="btn btn-primary">
                        + Add Team Member
                    </button>
                </div>
            </div>

            <div className={`card ${styles.tableCard}`}>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Last Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((member: StaffMember) => (
                                <tr key={member.id}>
                                    <td className={styles.boldCell}>{member.name}</td>
                                    <td>
                                        <span className={`${styles.roleBadge} ${styles[member.role]}`}>
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </span>
                                    </td>
                                    <td className={styles.textMuted}>{member.email}</td>
                                    <td>
                                        <span className={`badge ${member.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className={styles.textMuted}>
                                        {new Date(member.lastActive).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button className={`btn btn-ghost btn-sm ${styles.actionBtn}`}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
