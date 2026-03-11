'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

// ═══════════════════════════════════════════
// Google Analytics 4 + Microsoft Clarity
//
// SETUP INSTRUCTIONS:
// 1. Go to https://analytics.google.com → Create property → Get Measurement ID (G-XXXXXXXXXX)
// 2. Replace GA_MEASUREMENT_ID below with your real ID
// 3. Go to https://clarity.microsoft.com → Create project → Get Project ID
// 4. Replace CLARITY_PROJECT_ID below with your real ID
// ═══════════════════════════════════════════

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'vqxcwmrbj6';

export default function Analytics() {
    const [consentGiven, setConsentGiven] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (consent === 'accepted') {
            setTimeout(() => setConsentGiven(true), 0);
        }

        // Listen for consent changes
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'cookieConsent' && e.newValue === 'accepted') {
                setConsentGiven(true);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Don't load any scripts if user hasn't consented
    if (!consentGiven) return null;

    const hasGA4 = GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
    const hasClarity = true; // Clarity ID: vqxcwmrbj6

    if (!hasGA4 && !hasClarity) return null;

    return (
        <>
            {/* Google Analytics 4 */}
            {hasGA4 && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                        strategy="afterInteractive"
                    />
                    <Script id="ga4-init" strategy="afterInteractive">
                        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
              window.trackEvent = function(eventName, params) {
                gtag('event', eventName, params);
              };
            `}
                    </Script>
                </>
            )}

            {/* Microsoft Clarity — Heatmaps & Session Recordings */}
            {hasClarity && (
                <Script id="clarity-init" strategy="afterInteractive">
                    {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
          `}
                </Script>
            )}
        </>
    );
}
