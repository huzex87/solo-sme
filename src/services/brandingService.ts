import { Tenant } from './tenantService';
export type Industry = 'Boutique' | 'Tech' | 'Food' | 'Services' | 'Minimalist';

export interface IndustryPreset {
    primary: string;
    secondary: string;
    font: string;
    vibe: 'sharp' | 'round' | 'luxury';
}

const INDUSTRY_PRESETS: Record<Industry, IndustryPreset> = {
    'Boutique': {
        primary: 'hsl(330, 85%, 60%)', // Vibrant Pink/Rose
        secondary: 'hsl(260, 85%, 65%)', // Purple
        font: 'var(--font-inter), sans-serif',
        vibe: 'luxury'
    },
    'Tech': {
        primary: 'hsl(210, 100%, 55%)', // Electric Blue
        secondary: 'hsl(180, 100%, 45%)', // Cyan
        font: 'var(--font-inter), sans-serif',
        vibe: 'sharp'
    },
    'Food': {
        primary: 'hsl(15, 95%, 55%)', // Warm Orange/Red
        secondary: 'hsl(45, 95%, 50%)', // Golden Yellow
        font: 'var(--font-inter), sans-serif',
        vibe: 'round'
    },
    'Services': {
        primary: 'hsl(160, 100%, 40%)', // Professional Teal
        secondary: 'hsl(200, 100%, 45%)', // Deep Sky
        font: 'var(--font-inter), sans-serif',
        vibe: 'luxury'
    },
    'Minimalist': {
        primary: 'hsl(240, 5%, 85%)', // Light Gray
        secondary: 'hsl(240, 5%, 45%)', // Mid Gray
        font: 'var(--font-inter), sans-serif',
        vibe: 'luxury'
    }
};

export class BrandingService {
    /**
     * Generates CSS variable overrides for a tenant.
     * This enables full personalization and industry-specific aesthetics.
     */
    static getBrandingStyles(tenant: Tenant): React.CSSProperties {
        const tenantData = tenant as unknown as { industry?: Industry; branding_config?: Record<string, string> };
        const industry = tenantData.industry || 'Boutique';
        const preset = INDUSTRY_PRESETS[industry];
        const config = tenantData.branding_config || {};

        const vibeRadius = {
            'sharp': '4px',
            'round': '24px',
            'luxury': '12px'
        };

        return {
            '--h-primary': preset.primary.match(/\d+/)?.[0] || '262',
            '--accent-primary': config.primaryColor || preset.primary,
            '--accent-secondary': config.secondaryColor || preset.secondary,
            '--font-family': config.fontFamily || preset.font,
            '--radius-md': vibeRadius[preset.vibe],
            '--glass-level': config.glassLevel === 'high' ? '25px' : '15px',
            '--brand-logo': config.logoUrl ? `url(${config.logoUrl})` : 'none',
        } as React.CSSProperties;
    }
}
