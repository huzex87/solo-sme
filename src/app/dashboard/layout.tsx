'use client';

import { ReactNode } from "react";
import { TenantProvider } from '@/context/TenantContext';
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import MobileNav from "@/components/dashboard/MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <TenantProvider>
            <div style={{
                display: 'flex',
                height: '100dvh',
                background: 'var(--surface)',
                overflow: 'hidden',
            }}>
                {/* Desktop sidebar — hidden on mobile via CSS */}
                <div className="desktop-only">
                    <Sidebar />
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                }}>
                    <TopBar />
                    <main
                        className="mobile-bottom-pad"
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            padding: 'clamp(12px, 3vw, 32px)',
                            WebkitOverflowScrolling: 'touch',
                        }}
                    >
                        <div style={{
                            maxWidth: 'var(--content-max)',
                            margin: '0 auto',
                            width: '100%',
                        }}>
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile bottom tab bar */}
            <MobileNav />
        </TenantProvider>
    );
}
