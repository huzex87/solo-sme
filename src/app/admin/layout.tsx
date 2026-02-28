import AdminSidebar from './Sidebar';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.adminLayout}>
            <AdminSidebar />
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
