'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center noise-bg">
            <div className="max-w-md w-100 p-8 glass-card border-glass shadow-glow-primary animate-fadeIn">
                <div className="text-6xl mb-6">⚠️</div>
                <h1 className="text-3xl font-black mb-2 gradient-text">Something went wrong</h1>
                <p className="text-secondary mb-8 leading-relaxed">
                    A critical error occurred. Our team has been notified.
                    Please try refreshing the page or return to the safety of the dashboard.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="btn btn-primary w-full py-4 text-sm font-bold tracking-widest uppercase"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/dashboard"
                        className="btn btn-ghost w-full py-4 text-sm font-bold tracking-widest uppercase"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
