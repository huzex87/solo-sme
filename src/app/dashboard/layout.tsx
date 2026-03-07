'use client';

import { useState } from 'react';
import { TenantProvider } from '@/context/TenantContext';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import MobileNav from '@/components/dashboard/MobileNav';
import CommandPalette from '@/components/dashboard/CommandPalette';
import NotificationPulse from '@/components/dashboard/NotificationPulse';
import FeedbackButton from '@/components/dashboard/FeedbackButton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import SupportWidget from '@/components/dashboard/SupportWidget';
import { CSPostHogProvider } from '@/components/providers/PostHogProvider';
import styles from './layout.module.css';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <CSPostHogProvider>
            <TenantProvider>
                <div className={styles.dashboardLayout}>
                    <div className="nebula-container">
                        <div className="nebula nebula-primary" />
                        <div className="nebula nebula-secondary" />
                        <div className="nebula nebula-tertiary" />
                    </div>

                    {/* Mobile Overlay */}
                    {isSidebarOpen && (
                        <div
                            className={styles.mobileOverlay}
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                    <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                    <main className={styles.mainArea}>
                        <div className={styles.content}>
                            <ErrorBoundary>
                                {children}
                            </ErrorBoundary>
                        </div>
                    </main>
                    <MobileNav />
                    <CommandPalette />
                    <NotificationPulse />
                    <FeedbackButton />
                    <SupportWidget />
                </div>
            </TenantProvider>
        </CSPostHogProvider>
    );
}


