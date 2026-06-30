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
        const tenantData = tenant as unknown as { industry?: Industry; branding_config?: Record<string, any> };
        const industry = tenantData.industry || 'Boutique';
        const preset = INDUSTRY_PRESETS[industry];
        const config = tenantData.branding_config || {};
        const themeStyle = config.themeStyle || 'minimalist';

        // Base values
        const primary = config.primaryColor || preset.primary;
        const accent = config.accentColor || preset.secondary;
        const font = config.fontFamily || preset.font;

        // Custom style values
        let radiusCard = '16px';
        let radiusButton = '12px';
        let borderCard = '1px solid rgba(0,0,0,0.07)';
        let shadowCard = '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)';
        let fontOverride = font;
        let glassBg = 'rgba(255, 255, 255, 0.82)';
        let glassBlur = '16px';
        let glassBorder = '1px solid rgba(255, 255, 255, 0.3)';

        if (themeStyle === 'glassmorphism') {
            radiusCard = '24px';
            radiusButton = '9999px';
            borderCard = '1px solid rgba(255, 255, 255, 0.3)';
            shadowCard = '0 8px 32px 0 rgba(31, 38, 135, 0.06)';
            glassBg = 'rgba(255, 255, 255, 0.7)';
            glassBlur = '20px';
        } else if (themeStyle === 'neobrutalism') {
            radiusCard = '0px';
            radiusButton = '0px';
            borderCard = '3.5px solid #072435'; // Bold black/navy border
            shadowCard = '6px 6px 0px #072435'; // Flat drop shadow offset
        } else if (themeStyle === 'luxury') {
            radiusCard = '6px';
            radiusButton = '4px';
            borderCard = '1px solid rgba(7, 36, 53, 0.15)';
            shadowCard = '0 20px 40px rgba(7, 36, 53, 0.03)';
            fontOverride = 'Georgia, serif';
        } else { // minimalist
            radiusCard = '12px';
            radiusButton = '8px';
            borderCard = '1px solid rgba(0,0,0,0.08)';
            shadowCard = '0 1px 2px rgba(0,0,0,0.05)';
        }

        return {
            '--primary': primary,
            '--primary-hover': primary,
            '--accent-primary': primary,
            '--accent-secondary': accent,
            '--font-family': fontOverride,
            '--radius-card': radiusCard,
            '--radius-button': radiusButton,
            '--border-card': borderCard,
            '--shadow-card': shadowCard,
            '--glass-bg': glassBg,
            '--glass-blur': glassBlur,
            '--glass-border': glassBorder,
            '--radius-md': radiusButton,
            '--brand-logo': config.logoUrl ? `url(${config.logoUrl})` : 'none',
        } as React.CSSProperties;
    }
}
