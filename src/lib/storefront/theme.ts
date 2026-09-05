/**
 * Resolves a storefront's brand theme from its tenant record.
 *
 * Colour precedence (per product decision "logo first, then sector"):
 *   1. An explicit brand colour the merchant chose in settings
 *      (branding_config.primaryColor with autoThemeFromLogo === false).
 *   2. A colour previously extracted from the merchant's logo and cached
 *      (branding_config.logoColor) — lets the server paint the right colour
 *      with no flash before the client re-checks the live logo.
 *   3. The sector palette default for the merchant's business type.
 *
 * When no explicit colour is locked and a logo exists, <LogoThemer> re-extracts
 * the dominant colour on the client and overrides (1 flash-free thanks to the
 * cached value in 2). Colour SHADES and TINTS are derived in CSS with
 * color-mix, so this only needs to emit --primary and --accent.
 */
import type { CSSProperties } from 'react';
import { getSectorPreset, resolveSectorKey, type SectorPreset, type SectorKey } from './sectors';
import type { Tenant } from '@/types';

export interface StoreFounder {
    name?: string;
    role?: string;
    photo?: string;
    quote?: string;
    message?: string;
}

export interface StoreTheme {
    sectorKey: SectorKey;
    preset: SectorPreset;
    primary: string;
    accent: string;
    /** true when colour comes from sector/logo (not a locked manual choice). */
    autoThemeFromLogo: boolean;
    logoUrl?: string;
    founder: StoreFounder | null;
    cssVars: CSSProperties;
}

const isColor = (v?: string): v is string =>
    !!v && /^(#|rgb|hsl)/i.test(v.trim());

export function resolveStoreTheme(tenant: Tenant): StoreTheme {
    const branding = (tenant.branding_config || {}) as Tenant['branding_config'] & {
        logoColor?: string;
        autoThemeFromLogo?: boolean;
        founder?: StoreFounder;
    };
    const businessType = tenant.business_config?.business_type || tenant.category;
    const sectorKey = resolveSectorKey(businessType);
    const preset = getSectorPreset(businessType);

    // Colour precedence:
    //  - A merchant who has a brand colour and has NOT opted into logo-theming
    //    keeps that colour (respects existing/chosen stores — no surprise reskin).
    //  - Otherwise the storefront themes from the logo (client-side, live) with a
    //    cached logo colour or the sector palette as the flash-free SSR default.
    const manualLock = isColor(branding.primaryColor) && branding.autoThemeFromLogo !== true;
    const autoThemeFromLogo = !manualLock;

    let primary: string;
    if (manualLock) {
        primary = branding.primaryColor;
    } else if (isColor(branding.logoColor)) {
        primary = branding.logoColor; // cached logo colour — no flash
    } else {
        primary = preset.palette.primary;
    }

    // Accent stays with the sector unless the merchant set one explicitly.
    const accent = isColor(branding.accentColor) && manualLock
        ? branding.accentColor
        : preset.palette.accent;

    const logoUrl = branding.logoUrl || tenant.logo_url || undefined;

    const f = branding.founder;
    const founder: StoreFounder | null =
        f && (f.name || f.quote || f.message) ? f : null;

    const cssVars = {
        '--accent-primary': primary,
        '--accent-secondary': accent,
        '--primary': primary,
        '--accent': accent,
        '--store-display': preset.display,
        '--card-ratio': preset.cardRatio,
    } as CSSProperties;

    return { sectorKey, preset, primary, accent, autoThemeFromLogo, logoUrl, founder, cssVars };
}
