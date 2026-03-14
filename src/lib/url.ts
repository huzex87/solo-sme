/**
 * SOLO Unified URL Service
 * Ensures consistent domain resolution and URL construction system-wide.
 * Hardens against .solo.ng vs .solosme.ng drift.
 */

export const PLATFORM_DOMAIN = 'solosme.ng';

export class URLService {
    /**
     * Get the full URL for a store storefront
     */
    static getStoreUrl(subdomain: string, path: string = ''): string {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;

        // For local development
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            const port = window.location.port;
            return `${window.location.protocol}//${subdomain}.localhost${port ? `:${port}` : ''}${cleanPath}`;
        }

        return `https://${subdomain}.${PLATFORM_DOMAIN}${cleanPath}`;
    }

    /**
     * Get the full URL for a custom domain (verified)
     */
    static getCustomDomainUrl(domain: string, path: string = ''): string {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `https://${domain}${cleanPath}`;
    }

    /**
     * Universal resolver that prioritizes custom domains if present
     */
    static getTenantPublicUrl(tenant: { subdomain: string; custom_domain?: string | null }, path: string = ''): string {
        if (tenant.custom_domain) {
            return this.getCustomDomainUrl(tenant.custom_domain, path);
        }
        return this.getStoreUrl(tenant.subdomain, path);
    }

    /**
     * Construct dashboard URLs consistently
     */
    static getDashboardUrl(path: string = ''): string {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const base = typeof window !== 'undefined' ? window.location.origin : `https://app.${PLATFORM_DOMAIN}`;
        return `${base}${cleanPath}`;
    }
}
