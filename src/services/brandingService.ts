import { Tenant } from './tenantService';

export class BrandingService {
    /**
     * Generates CSS variable overrides for a tenant.
     * This enables full personilization and white-labeling.
     */
    static getBrandingStyles(tenant: Tenant): React.CSSProperties {
        const config = (tenant as any).branding_config || {};

        return {
            '--accent-primary': config.primaryColor || '#7c4dff',
            '--accent-secondary': config.secondaryColor || '#00e5ff',
            '--font-family': config.fontFamily || 'Outfit',
            '--glass-blur': config.glassLevel === 'high' ? '20px' : '10px',
        } as React.CSSProperties;
    }
}
