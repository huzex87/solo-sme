import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import styles from './layout.module.css';

export const metadata = {
    title: 'Dashboard | SOLO',
    description: 'Manage your business from the SOLO Command Center.',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.dashboardLayout}>
            <Sidebar />
            <TopBar />
            <main className={styles.mainArea}>
                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
