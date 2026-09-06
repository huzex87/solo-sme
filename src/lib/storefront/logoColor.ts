/**
 * Dominant-colour extraction from a store logo (browser only).
 *
 * Shared by the storefront <LogoThemer> (runtime theming) and the dashboard
 * settings save (persists the result to branding_config.logoColor so the server
 * can paint the brand colour with no flash on the next visit).
 *
 * Samples the logo's most vibrant colour on a small canvas and darkens it just
 * enough to read as text/fills on a white surface. Returns null when the image
 * can't be read (CORS taint, load failure) so callers fall back gracefully.
 */

function toHex(n: number): string {
    return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

/** Darken a colour until it is legible on a white surface. */
function ensureReadable(r: number, g: number, b: number): [number, number, number] {
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    if (lum <= 0.62) return [r, g, b];
    const scale = 0.62 / Math.max(lum, 0.0001);
    return [r * scale, g * scale, b * scale];
}

export function extractDominantColor(img: HTMLImageElement): string | null {
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
        const key = `${r >> 3},${g >> 3},${b >> 3}`;
        const cur = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0, score: 0 };
        cur.r += r; cur.g += g; cur.b += b; cur.n += 1;
        cur.score += sat;
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

/** Load an image URL and extract its dominant colour. Resolves null on failure. */
export function extractDominantColorFromUrl(url: string): Promise<string | null> {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !url) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        let settled = false;
        const done = (v: string | null) => { if (!settled) { settled = true; resolve(v); } };
        img.onload = () => done(extractDominantColor(img));
        img.onerror = () => done(null);
        // safety timeout so a save is never blocked on a slow/hung image
        setTimeout(() => done(null), 4000);
        img.src = url;
    });
}
