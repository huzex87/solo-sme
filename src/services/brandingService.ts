import { Tenant } from './tenantService';

export class BrandingService {
    /**
     * Generates CSS variable overrides for a tenant.
     * This enables full personilization and white-labeling.
     */
    static getBrandingStyles(tenant: Tenant): React.CSSProperties {
        const config = (tenant as any).branding_config || {};

        const typographyPairs: Record<string, string> = {
            'Modern': 'Outfit, sans-serif',
            'Luxury': 'Playfair Display, serif',
            'Minimalist': 'Inter, sans-serif',
            'Classic': 'Georgia, serif'
        };

        return {
            '--accent-primary': config.primaryColor || '#7c4dff',
            '--accent-secondary': config.secondaryColor || '#00e5ff',
            '--font-family': typographyPairs[config.typographyPair] || config.fontFamily || 'Outfit',
            '--glass-level': config.glassLevel === 'high' ? '20px' : '10px',
            '--brand-logo': config.logoUrl ? `url(${config.logoUrl})` : 'none',
        } as React.CSSProperties;
    }
}
