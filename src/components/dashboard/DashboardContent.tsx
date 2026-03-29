'use client';

import { ReactNode } from 'react';
import { useTenant } from '@/context/TenantContext';
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import MobileNav from "@/components/layout/MobileNav";
import { MobileSidebarStyles } from "@/components/dashboard/MobileSidebar";
import { BrandLogo } from "@/components/shared/BrandLogo";

export function DashboardContent({ children }: { children: ReactNode }) {
    const { isLoading, isAuthenticated, error } = useTenant();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-5 text-center p-6">
                    <BrandLogo variant="light" size={52} showText={true} textSide="bottom" />
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Setting up your store context</p>
                </div>
            </div>
        );
    }

    if (error && isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-[100dvh] bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Store Context Error</h2>
                    <div className="bg-red-50 p-4 rounded-xl mb-6">
                        <p className="text-red-700 text-sm font-code break-words">{error}</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                        >
                            Retry Loading
                        </button>
                        <p className="text-slate-400 text-xs">
                            If this persists, please ensure your account setup is complete.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-[var(--background)]">
            {/* Sidebar */}
            <Sidebar />

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 lg:pb-0 scroll-native">
                    <div className="w-full max-w-[var(--content-max)] mx-auto px-4 py-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
            <MobileNav />
            <MobileSidebarStyles />
        </div>
    );
}
