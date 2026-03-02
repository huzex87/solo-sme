'use client';

import { TenantProvider } from '@/context/TenantContext';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import styles from './layout.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TenantProvider>
            <div className={styles.dashboardLayout}>
                <Sidebar />
                <TopBar />
                <main className={styles.mainArea}>
                    <div className={styles.content}>
                        {children}
                    </div>
                </main>
            </div>
        </TenantProvider>
    );
}
