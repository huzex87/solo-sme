'use client';

/**
 * Derives the storefront's brand colour from the merchant's logo.
 *
 * Runs only when the merchant hasn't locked a manual colour (autoTheme) and a
 * logo exists. It samples the logo's dominant vibrant colour on a tiny canvas
 * and overrides --primary / --accent-primary on the store wrapper. The server
 * already painted a sensible default (cached logo colour or sector palette), so
 * this is a progressive enhancement: if the image can't be read (CORS, load
 * error) the default simply stays.
 */
import { useEffect } from 'react';

interface Props {
    logoUrl?: string;
    /** false when the merchant has locked a manual brand colour. */
    enabled: boolean;
}

function toHex(n: number): string {
    return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

/** Ensure a colour is dark enough to read as text/fills on a white surface. */
function ensureReadable(r: number, g: number, b: number): [number, number, number] {
    // relative luminance (sRGB approximation)
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    if (lum <= 0.62) return [r, g, b];
    const scale = 0.62 / Math.max(lum, 0.0001);
    return [r * scale, g * scale, b * scale];
}

function dominantColor(img: HTMLImageElement): string | null {
    const size = 48;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, size, size);

    let data: Uint8ClampedArray;
    try {
        data = ctx.getImageData(0, 0, size, size).data;
    } catch {
        return null; // tainted canvas (CORS) — give up quietly
    }

    const buckets = new Map<string, { r: number; g: number; b: number; n: number; score: number }>();
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 128) continue;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        if (max > 244 && min > 244) continue; // near-white
        if (max < 22) continue;               // near-black
        const sat = max === 0 ? 0 : (max - min) / max;
        if (sat < 0.16) continue;             // greys carry no brand signal
        // quantise to 5 bits per channel so similar pixels share a bucket
        const key = `${r >> 3},${g >> 3},${b >> 3}`;
        const cur = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0, score: 0 };
        cur.r += r; cur.g += g; cur.b += b; cur.n += 1;
        cur.score += sat; // favour vibrant buckets
        buckets.set(key, cur);
    }
    if (buckets.size === 0) return null;

    let best: { r: number; g: number; b: number; n: number; score: number } | null = null;
    for (const c of buckets.values()) {
        if (!best || c.score > best.score) best = c;
    }
    if (!best) return null;

    const [r, g, b] = ensureReadable(best.r / best.n, best.g / best.n, best.b / best.n);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function LogoThemer({ logoUrl, enabled }: Props) {
    useEffect(() => {
        if (!enabled || !logoUrl) return;
        if (typeof window === 'undefined') return;

        const wrapper = document.querySelector<HTMLElement>('[data-store-wrapper]');
        if (!wrapper) return;

        let cancelled = false;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = () => {
            if (cancelled) return;
            const color = dominantColor(img);
            if (!color) return;
            wrapper.style.setProperty('--primary', color);
            wrapper.style.setProperty('--accent-primary', color);
        };
        img.onerror = () => { /* keep server default */ };
        img.src = logoUrl;

        return () => { cancelled = true; };
    }, [logoUrl, enabled]);

    return null;
}
