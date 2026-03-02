'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function LoadingBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Start loading on path change
        setLoading(true);
        setProgress(30);

        const timeout = setTimeout(() => {
            setProgress(100);
            const endTimeout = setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 200);
            return () => clearTimeout(endTimeout);
        }, 400);

        return () => clearTimeout(timeout);
    }, [pathname, searchParams]);

    if (!loading && progress === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            pointerEvents: 'none'
        }}>
            <div style={{
                height: '3px',
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                width: `${progress}%`,
                transition: 'width 0.3s ease-out, opacity 0.3s ease',
                boxShadow: '0 0 10px var(--accent-primary)',
                opacity: loading ? 1 : 0
            }} />
        </div>
    );
}
