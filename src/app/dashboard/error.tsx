'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Dashboard Error]', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
            <div className="w-20 h-20 rounded-[32px] bg-rose-50 flex items-center justify-center">
                <AlertTriangle size={40} className="text-rose-400" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-950 font-display tracking-tight">
                    Something went wrong
                </h2>
                <p className="text-slate-500 font-semibold text-sm max-w-sm">
                    {error.message || 'An unexpected error occurred while loading this page.'}
                </p>
                {error.digest && (
                    <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">
                        Ref: {error.digest}
                    </p>
                )}
            </div>
            <button
                onClick={reset}
                className="btn btn-primary h-12 rounded-2xl px-8 font-bold flex items-center gap-2"
            >
                <RefreshCw size={16} />
                Try Again
            </button>
        </div>
    );
}
