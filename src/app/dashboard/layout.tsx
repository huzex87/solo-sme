'use client';

import { ReactNode } from "react";
import { TenantProvider } from '@/context/TenantContext';
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import MobileNav from "@/components/layout/MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <TenantProvider>
            {/* ── Main App Shell — Institutional v3.0 ── */}
            <div className="flex h-[100dvh] overflow-hidden bg-surface">

                {/* Desktop Sidebar — Hidden on Mobile via globals.css .desktop-only */}
                <aside className="desktop-only h-full flex-shrink-0">
                    <Sidebar />
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-surface overflow-hidden relative">

                    {/* Sticky TopBar */}
                    <TopBar />

                    {/* Scrollable Main Section */}
                    <main className="flex-1 overflow-y-auto overflow-x-hidden mobile-bottom-pad scroll-smooth native-scroll">
                        <div className="w-full max-w-[var(--content-max)] mx-auto p-4 md:p-8 lg:p-12">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile Navigation — Fixed at Bottom */}
            <MobileNav />
        </TenantProvider>
    );
}
