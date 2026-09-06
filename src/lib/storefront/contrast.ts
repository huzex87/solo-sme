/**
 * Minimal WCAG contrast helpers for storefront theming.
 *
 * A merchant's brand/accent colour (or one extracted from their logo) is great
 * as a fill, but often fails WCAG AA (4.5:1) when used for small text on a light
 * surface — the sector golds are the worst offenders. `readableOn` darkens a
 * colour just enough to clear a target ratio against a background, so brand
 * colours can be used for text (eyebrows, badges) without hurting legibility.
 */

function parseHex(hex: string): [number, number, number] | null {
    const m = hex.trim().replace('#', '');
    if (m.length === 3) {
        const r = parseInt(m[0] + m[0], 16);
        const g = parseInt(m[1] + m[1], 16);
        const b = parseInt(m[2] + m[2], 16);
        return [r, g, b];
    }
    if (m.length === 6) {
        const r = parseInt(m.slice(0, 2), 16);
        const g = parseInt(m.slice(2, 4), 16);
        const b = parseInt(m.slice(4, 6), 16);
        if ([r, g, b].every((n) => !Number.isNaN(n))) return [r, g, b];
    }
    return null;
}

const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');

function channelLum(c: number): number {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance([r, g, b]: [number, number, number]): number {
    return 0.2126 * channelLum(r) + 0.7152 * channelLum(g) + 0.0722 * channelLum(b);
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
    const la = luminance(a), lb = luminance(b);
    const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
}

/**
 * Returns `color` darkened toward black until it meets `target` contrast against
 * `bg` (default white / AA 4.5:1). Falls back to the original string if it can't
 * be parsed as hex, and to near-black if darkening alone can't reach the target.
 */
export function readableOn(color: string, bg = '#ffffff', target = 4.5): string {
    const rgb = parseHex(color);
    const bgRgb = parseHex(bg);
    if (!rgb || !bgRgb) return color;
    if (contrast(rgb, bgRgb) >= target) return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;

    let [r, g, b] = rgb;
    // Scale toward black in small steps until we clear the target (or bottom out).
    for (let i = 0; i < 24; i++) {
        r *= 0.9; g *= 0.9; b *= 0.9;
        if (contrast([r, g, b], bgRgb) >= target) break;
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
