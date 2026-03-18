'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrdersError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error('[Orders Error]', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
            <div className="w-20 h-20 rounded-[32px] bg-rose-50 flex items-center justify-center">
                <AlertTriangle size={40} className="text-rose-400" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-950 font-display tracking-tight">
                    Orders unavailable
                </h2>
                <p className="text-slate-500 font-semibold text-sm max-w-sm">
                    {error.message || 'We could not load your orders. This is usually a temporary issue.'}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="btn h-12 rounded-2xl px-6 font-bold flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:border-slate-400 transition-all"
                >
                    <ArrowLeft size={16} />
                    Dashboard
                </button>
                <button
                    onClick={reset}
                    className="btn btn-primary h-12 rounded-2xl px-8 font-bold flex items-center gap-2"
                >
                    <RefreshCw size={16} />
                    Retry
                </button>
            </div>
        </div>
    );
}
