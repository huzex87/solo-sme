'use client';

/**
 * Derives the storefront's brand colour from the merchant's logo at runtime.
 *
 * The server already paints a sensible default — a colour cached at save time
 * (branding_config.logoColor) or the sector palette — so this is a progressive
 * enhancement that keeps the store correct when the logo changed since the last
 * save. It runs only when the merchant hasn't locked a manual colour and a logo
 * exists; if the image can't be read (CORS, load error) the server default
 * simply stays.
 */
import { useEffect } from 'react';
import { extractDominantColorFromUrl } from '@/lib/storefront/logoColor';

interface Props {
    logoUrl?: string;
    /** false when the merchant has locked a manual brand colour. */
    enabled: boolean;
    /** colour already applied by the server (skip the work if we'd match it). */
    appliedColor?: string;
}

export default function LogoThemer({ logoUrl, enabled, appliedColor }: Props) {
    useEffect(() => {
        if (!enabled || !logoUrl) return;
        let cancelled = false;
        extractDominantColorFromUrl(logoUrl).then((color) => {
            if (cancelled || !color) return;
            if (appliedColor && color.toLowerCase() === appliedColor.toLowerCase()) return;
            const wrapper = document.querySelector<HTMLElement>('[data-store-wrapper]');
            if (!wrapper) return;
            wrapper.style.setProperty('--primary', color);
            wrapper.style.setProperty('--accent-primary', color);
        });
        return () => { cancelled = true; };
    }, [logoUrl, enabled, appliedColor]);

    return null;
}
