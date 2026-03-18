'use client';

import { useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';

export default function AnalyticsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Analytics Error]', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
            <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center">
                <BarChart3 size={40} className="text-slate-200" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-950 font-display tracking-tight">
                    Analytics unavailable
                </h2>
                <p className="text-slate-500 font-semibold text-sm max-w-sm">
                    We could not compute your metrics right now. Your data is safe — this is a temporary issue.
                </p>
            </div>
            <button
                onClick={reset}
                className="btn btn-primary h-12 rounded-2xl px-8 font-bold flex items-center gap-2"
            >
                <RefreshCw size={16} />
                Retry
            </button>
        </div>
    );
}
