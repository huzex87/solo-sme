'use client';

import { ReactNode } from "react";
import { TenantProvider } from '@/context/TenantContext';
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import MobileNav from "@/components/dashboard/MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <TenantProvider>
            {/* ── Responsive wrapper ── */}
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
                    <main style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: 'clamp(12px, 3vw, 32px)',
                        paddingBottom: 'calc(clamp(12px, 3vw, 32px) + env(safe-area-inset-bottom, 0px) + 68px)',
                    }}>
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

            {/* Mobile bottom tab bar — hidden on desktop via CSS */}
            <MobileNav />
        </TenantProvider>
    );
}
