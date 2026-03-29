'use client';

import { useEffect, useState } from 'react';
import { X, Share } from 'lucide-react';
import { BrandLogo } from '@/components/shared/BrandLogo';

/**
 * iOS Safari does not fire `beforeinstallprompt`.
 * The only way to install a PWA on iOS is: Share → Add to Home Screen.
 * This component detects iOS Safari (not already running as standalone)
 * and shows a one-time bottom banner guiding the user through it.
 */
export default function IOSInstallPrompt() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true;
        const dismissed = sessionStorage.getItem('ios-install-dismissed');

        if (isIOS && !isStandalone && !dismissed) {
            // Delay slightly so it doesn't compete with page paint
            const t = setTimeout(() => setShow(true), 2500);
            return () => clearTimeout(t);
        }
    }, []);

    function dismiss() {
        sessionStorage.setItem('ios-install-dismissed', '1');
        setShow(false);
    }

    if (!show) return null;

    return (
        <div
            role="dialog"
            aria-label="Install SOLO SME"
            className="fixed bottom-0 inset-x-0 z-[9999] px-4 pb-6 animate-[slideUp_0.35s_ease-out]"
        >
            <div className="bg-[#072435] rounded-2xl p-4 shadow-2xl border border-white/10 flex gap-3 items-start max-w-sm mx-auto">
                <BrandLogo variant="monochrome-white" size={44} showText={false} />

                <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-tight">
                        Install SOLO on your iPhone
                    </p>
                    <p className="text-white/55 text-xs mt-1 leading-snug">
                        Tap the{' '}
                        <span className="inline-flex items-center gap-0.5 text-white/80 font-semibold">
                            <Share size={11} className="inline" />
                            {' '}Share
                        </span>
                        {' '}button in Safari, then choose{' '}
                        <span className="text-white/80 font-semibold">&ldquo;Add to Home Screen&rdquo;</span>
                        .
                    </p>
                </div>

                <button
                    onClick={dismiss}
                    aria-label="Dismiss"
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
