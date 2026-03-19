import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://solosme.ng';

    // Core platform pages
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/docs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ];

    // Dynamic tenant storefronts
    let tenantRoutes: MetadataRoute.Sitemap = [];
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data: tenants } = await supabase
                .from('tenants')
                .select('subdomain, updated_at')
                .not('subdomain', 'is', null)
                .limit(500);

            if (tenants) {
                tenantRoutes = tenants.map((t) => ({
                    url: `${baseUrl}/store/${t.subdomain}`,
                    lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
                    changeFrequency: 'daily' as const,
                    priority: 0.8,
                }));
            }
        }
    } catch {
        // Silently fail — static sitemap is still useful
    }

    return [...staticRoutes, ...tenantRoutes];
}
