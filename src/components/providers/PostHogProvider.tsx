'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

if (typeof window !== 'undefined') {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    if (posthogKey) {
        posthog.init(posthogKey, {
            api_host: posthogHost,
            person_profiles: 'identified_only',
            capture_pageview: false, // We'll handle this manually for better accuracy in Next.js
            loaded: (ph) => {
                if (process.env.NODE_ENV === 'development') ph.debug();
            },
        });
    }
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Optional: Add manual pageview capturing logic here for Next.js app router if needed
    }, []);

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
