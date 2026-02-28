import { StaffService } from '@/services/staffService';
import { StaffMember } from '@/types';
import styles from './staff.module.css';

export default async function StaffPage() {
    const staff = await StaffService.getStaff('t1');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Staff Management</h1>
                    <p className={styles.subtitle}>Manage roles, permissions, and team access.</p>
                </div>
                <button className="btn btn-primary">
                    + Add Team Member
                </button>
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
