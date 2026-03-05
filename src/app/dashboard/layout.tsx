import { TenantProvider } from '@/context/TenantContext';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import CommandPalette from '@/components/dashboard/CommandPalette';
import NotificationPulse from '@/components/dashboard/NotificationPulse';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import styles from './layout.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TenantProvider>
            <div className={styles.dashboardLayout}>
                <div className="nebula-container">
                    <div className="nebula nebula-primary" />
                    <div className="nebula nebula-secondary" />
                    <div className="nebula nebula-tertiary" />
                </div>
                <Sidebar />
                <TopBar />
                <main className={styles.mainArea}>
                    <div className={styles.content}>
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </div>
                </main>
                <CommandPalette />
                <NotificationPulse />
            </div>
        </TenantProvider>
    );
}
