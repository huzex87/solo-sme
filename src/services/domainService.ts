import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface DomainVerification {
    domain: string;
    status: 'pending' | 'verified' | 'failed' | 'configuring';
    type: 'subdomain' | 'custom';
    verification?: {
        type: string;
        domain: string;
        value: string;
        reason: string;
    }[];
}

export class DomainService {
    private static VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    private static VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
    private static VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

    /**
     * Checks if a custom domain or subdomain is available.
     */
    static async checkAvailability(name: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { data } = await supabase
            .from('tenants')
            .select('id')
            .or(`subdomain.eq.${name},custom_domain.eq.${name}`)
            .maybeSingle();

        return !data;
    }

    /**
     * Registers a custom domain with Vercel and updates the tenant record.
     */
    static async registerCustomDomain(tenantId: string, domain: string): Promise<DomainVerification> {
        logger.info('Registering custom domain', { domain, tenantId });

        if (!this.VERCEL_TOKEN || !this.VERCEL_PROJECT_ID) {
            console.warn('[DomainService] Vercel API credentials missing. Running in simulation mode.');
            return { domain, status: 'pending', type: 'custom' };
        }

        try {
            // 1. Add domain to Vercel project
            const response = await fetch(
                `https://api.vercel.com/v9/projects/${this.VERCEL_PROJECT_ID}/domains${this.VERCEL_TEAM_ID ? `?teamId=${this.VERCEL_TEAM_ID}` : ''}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.VERCEL_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: domain })
                }
            );

            const data = await response.json();

            if (!response.ok && data.error?.code !== 'domain_already_in_use') {
                throw new Error(data.error?.message || 'Failed to add domain to Vercel');
            }

            // 2. Update tenant record in Supabase
            if (isSupabaseConfigured) {
                await supabase
                    .from('tenants')
                    .update({ custom_domain: domain })
                    .eq('id', tenantId);
            }

            return {
                domain,
                status: 'pending',
                type: 'custom'
            };
        } catch (error) {
            logger.error('Failed to register custom domain', { error, domain });
            throw error;
        }
    }

    /**
     * Checks the configuration status of a domain on Vercel.
     */
    static async checkDomainConfiguration(domain: string): Promise<DomainVerification> {
        if (!this.VERCEL_TOKEN || !this.VERCEL_PROJECT_ID) {
            return { domain, status: 'verified', type: 'custom' }; // Simulation
        }

        try {
            const [configRes, verifyRes] = await Promise.all([
                fetch(
                    `https://api.vercel.com/v6/domains/${domain}/config${this.VERCEL_TEAM_ID ? `?teamId=${this.VERCEL_TEAM_ID}` : ''}`,
                    { headers: { Authorization: `Bearer ${this.VERCEL_TOKEN}` } }
                ),
                fetch(
                    `https://api.vercel.com/v9/projects/${this.VERCEL_PROJECT_ID}/domains/${domain}${this.VERCEL_TEAM_ID ? `?teamId=${this.VERCEL_TEAM_ID}` : ''}`,
                    { headers: { Authorization: `Bearer ${this.VERCEL_TOKEN}` } }
                )
            ]);

            const config = await configRes.json();
            const verification = await verifyRes.json();

            const isConfigured = !config.misconfigured;
            const isVerified = verification.verified;

            return {
                domain,
                status: isVerified && isConfigured ? 'verified' : 'configuring',
                type: 'custom',
                verification: verification.verification
            };
        } catch (error) {
            logger.error('Domain configuration check failed', { error, domain });
            return { domain, status: 'failed', type: 'custom' };
        }
    }

    /**
     * Resolves a tenant from a hostname (subdomain or custom domain).
     */
    static async resolveTenant(host: string): Promise<{ id: string; subdomain: string } | null> {
        if (!isSupabaseConfigured) return null;

        // Clean host (remove port if present)
        const hostname = host.split(':')[0].toLowerCase();

        // 1. High-speed short-circuit for platform domains
        if (['www', 'api', 'app', 'localhost', 'solo-sme'].includes(hostname.split('.')[0])) {
            return null;
        }

        // 2. Database lookup (check both subdomain and custom_domain)
        // We optimize by checking subdomain first if it looks like one, or searching both
        const { data, error } = await supabase
            .from('tenants')
            .select('id, subdomain, custom_domain')
            .or(`subdomain.eq.${hostname.split('.')[0]},custom_domain.eq.${hostname}`)
            .maybeSingle();

        if (error || !data) {
            if (error) logger.error('Tenant resolution failed', { message: error.message, host });
            return null;
        }

        return {
            id: data.id,
            subdomain: data.subdomain
        };
    }

    /**
     * Removes a custom domain from Vercel and the tenant record.
     */
    static async removeCustomDomain(tenantId: string, domain: string): Promise<boolean> {
        if (!this.VERCEL_TOKEN || !this.VERCEL_PROJECT_ID) return true;

        try {
            await fetch(
                `https://api.vercel.com/v9/projects/${this.VERCEL_PROJECT_ID}/domains/${domain}${this.VERCEL_TEAM_ID ? `?teamId=${this.VERCEL_TEAM_ID}` : ''}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${this.VERCEL_TOKEN}` }
                }
            );

            if (isSupabaseConfigured) {
                await supabase
                    .from('tenants')
                    .update({ custom_domain: null })
                    .eq('id', tenantId);
            }

            return true;
        } catch (error) {
            logger.error('Failed to remove custom domain', { error, domain });
            return false;
        }
    }
}

