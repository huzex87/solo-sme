'use client';

import { ReactNode } from "react";
import { TenantProvider } from '@/context/TenantContext';
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <TenantProvider>
            <div style={{
                display: 'flex',
                height: '100vh',
                background: 'var(--surface)',
                overflow: 'hidden',
            }}>
                <Sidebar />
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
                        padding: 'clamp(16px, 3vw, 32px)',
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
        </TenantProvider>
    );
}
