'use client';

import { useEffect, useState } from 'react';
import { StaffService, StaffMember } from '@/services/staffService';
import { useTenant } from '@/context/TenantContext';
import { useToast } from '@/components/ui/ToastProvider';
import styles from './staff.module.css';
import { exportToCSV } from '@/utils/csvExport';
import {
    MoreHorizontal,
    ShieldCheck,
    UserPlus,
    Download,
    X,
    Loader2,
    Mail,
    User,
    ShieldAlert
} from 'lucide-react';

export default function StaffPage() {
    const { tenantId, isLoading: isTenantLoading } = useTenant();
    const { showToast } = useToast();
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newMember, setNewMember] = useState({
        name: '',
        email: '',
        role: 'staff' as StaffMember['role']
    });

    useEffect(() => {
        if (isTenantLoading) return;
        if (!tenantId) {
            setLoading(false);
            return;
        }

        const fetchStaff = async () => {
            const data = await StaffService.getStaff(tenantId);
            setStaff(data);
            setLoading(false);
        };
        fetchStaff();
    }, [tenantId, isTenantLoading]);

    const handleExport = () => {
        exportToCSV(staff as unknown as Record<string, unknown>[], 'SOLO_Staff_List');
        showToast('Staff list exported successfully.', 'success');
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId || !newMember.name || !newMember.email) return;

        setIsSaving(true);
        try {
            const result = await StaffService.addStaff(tenantId, newMember);
            if (result) {
                setStaff([result, ...staff]);
                setShowAddModal(false);
                setNewMember({ name: '', email: '', role: 'staff' });
                showToast('New team member synchronized with organization vault.', 'success');
            }
        } catch (err) {
            showToast('Failed to add team member.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin text-primary mb-4">
                <ShieldCheck size={40} />
            </div>
            <p className="text-muted font-bold tracking-widest uppercase text-xs">Initializing Secure Team Vault...</p>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Staff Management</h1>
                    <p className={styles.subtitle}>Institutional control over roles, permissions, and team access.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleExport}>
                        <Download size={16} className="mr-2" />
                        Export
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
                        <UserPlus size={16} className="mr-2" />
                        Add Member
                    </button>
                </div>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Email Address</th>
                            <th>Status</th>
                            <th>Last Active</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((member: StaffMember) => (
                            <tr key={member.id}>
                                <td>
                                    <div className={styles.staffName}>{member.name}</div>
                                </td>
                                <td>
                                    <span className={`${styles.roleBadge} ${styles[`role_${member.role}`]}`}>
                                        {member.role === 'owner' ? 'Principal' : member.role}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.email}>{member.email}</div>
                                </td>
                                <td>
                                    {member.status === 'active' ? (
                                        <div className={styles.statusActive}>
                                            <span className={styles.statusDot} />
                                            Active
                                        </div>
                                    ) : (
                                        <div className="text-muted" style={{ fontSize: '13px' }}>Offline</div>
                                    )}
                                </td>
                                <td>
                                    <div className={styles.lastActive}>
                                        {new Date(member.lastActive).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className={styles.actionBtn}>
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {staff.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                        No staff members found. Start by adding your first team member.
                    </div>
                )}
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <div className={styles.modalHeader}>
                            <h3><ShieldCheck size={20} className="text-primary mr-2" /> Add Team Member</h3>
                            <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddStaff} className={styles.modalBody}>
                            <div className={styles.fieldGroup}>
                                <label>Full Name</label>
                                <div className={styles.inputWrapper}>
                                    <User size={16} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Institutional Name"
                                        value={newMember.name}
                                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Email Address</label>
                                <div className={styles.inputWrapper}>
                                    <Mail size={16} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="corporate@domain.com"
                                        value={newMember.email}
                                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Operational Role</label>
                                <div className={styles.inputWrapper}>
                                    <ShieldAlert size={16} />
                                    <select
                                        value={newMember.role}
                                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                                    >
                                        <option value="staff">Standard Staff</option>
                                        <option value="manager">Operations Manager</option>
                                        <option value="admin">System Administrator</option>
                                        <option value="cashier">Store Cashier</option>
                                        <option value="dispatcher">Logistics Dispatcher</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                    {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <UserPlus size={16} className="mr-2" />}
                                    {isSaving ? 'Authorizing...' : 'Invite to Organization'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
