'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function StoreError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Storefront Error]', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-6 bg-slate-50">
            <div className="w-20 h-20 rounded-[32px] bg-white shadow-soft-sm border border-slate-100 flex items-center justify-center">
                <AlertTriangle size={36} className="text-slate-300" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                    Store temporarily unavailable
                </h2>
                <p className="text-slate-500 font-semibold text-sm max-w-xs">
                    We&apos;re having trouble loading this store. Please try again in a moment.
                </p>
            </div>
            <button
                onClick={reset}
                className="btn btn-primary h-12 rounded-2xl px-8 font-bold flex items-center gap-2"
            >
                <RefreshCw size={16} />
                Reload Store
            </button>
        </div>
    );
}
