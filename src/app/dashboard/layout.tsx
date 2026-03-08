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
                    {/* Mobile Overlay */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[45]"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                    <div className={styles.mainWrapper}>
                        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                        <main className={styles.contentArea}>
                            <ErrorBoundary>
                                {children}
                            </ErrorBoundary>
                        </main>
                    </div>

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


