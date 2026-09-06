import Link from 'next/link';
import { Metadata } from 'next';
import styles from './store.module.css';
import { ProductService } from '@/services/productService';
import { TenantService } from '@/services/tenantService';
import { createClient } from '@/lib/supabase/server';
import ProductCatalog from '@/components/storefront/ProductCatalog';
import { StoreHero, FounderSection, FeatureIcon } from '@/components/storefront/StorefrontHero';
import { resolveStoreTheme } from '@/lib/storefront/theme';
import { WhatsAppUtils } from '@/lib/whatsapp';
import type { Tenant } from '@/types';

const PRODUCTS_PER_PAGE = 24;

interface PageProps {
    params: Promise<{ subdomain: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
    const { subdomain } = await params;
    const supabase = await createClient();
    const tenant = await TenantService.getTenantBySubdomain(subdomain, supabase);

    if (!tenant) return { title: 'Store Not Found | SOLO' };

    const description = tenant.store_description || tenant.description || `Shop ${tenant.name} — quality products delivered across Nigeria.`;

    return {
        title: `${tenant.name} | SOLO SME`,
        description,
        openGraph: {
            title: tenant.name,
            description,
            type: 'website',
            // OG image is supplied by the dynamic opengraph-image route (branded
            // per store); leaving images unset here lets that file convention win.
        },
        twitter: {
            card: 'summary_large_image',
            title: tenant.name,
            description,
        },
    };
}

export default async function StorePage({ params, searchParams }: PageProps) {
    const { subdomain } = await params;
    const { page: pageParam } = await searchParams;
    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const offset = (page - 1) * PRODUCTS_PER_PAGE;

    const supabase = await createClient();
    const tenant = await TenantService.getTenantBySubdomain(subdomain, supabase);

    if (!tenant) {
        return (
            <div className={styles.errorState}>
                <h1>404</h1>
                <p>Store not found in our directory.</p>
                <Link href="/" className="btn btn-primary">Return Home</Link>
            </div>
        );
    }

    const products = await ProductService.getProducts(tenant.id, supabase, {
        limit: PRODUCTS_PER_PAGE,
        offset,
        activeOnly: true,
    });

    const currency = tenant.currency || 'NGN';
    const branding = tenant.branding_config || {};

    // Sector-adaptive defaults (palette handled in the layout; here we take copy,
    // feature set and founder). Merchant overrides always win over the preset.
    const { preset, founder } = resolveStoreTheme(tenant as unknown as Tenant);

    const heroEyebrow = preset.hero.eyebrow;
    const heroTitle = branding.hero?.title || `${preset.hero.titleLead} ${preset.hero.titleEmphasis}`;
    const heroSubtitle = branding.hero?.subtitle || preset.hero.subtitle;
    const heroCta = branding.hero?.ctaText || preset.hero.cta;
    const catalogTitle: string = branding.catalog_title || preset.catalogTitle;

    // "Order on WhatsApp" hero CTA when the store has a WhatsApp number.
    const waNumber = tenant.business_config?.whatsapp_number || tenant.business_config?.phone;
    const whatsappUrl = waNumber
        ? WhatsAppUtils.buildChatLink(waNumber, `Hi ${tenant.name}, I'd like to place an order.`)
        : null;

    const hasMore = products.length === PRODUCTS_PER_PAGE;

    return (
        <div className="animate-entrance">
            <StoreHero
                preset={preset}
                eyebrow={heroEyebrow}
                title={heroTitle}
                subtitle={heroSubtitle}
                ctaText={heroCta}
                shopHref="#catalog"
                whatsappUrl={whatsappUrl}
                windowProducts={products.map(p => ({
                    id: p.id, name: p.name, price: p.price, image_url: p.image_url, category: p.category,
                }))}
                currency={currency}
                subdomain={subdomain}
            />

            {/* Sector feature strip */}
            <section className={styles.featuredSection}>
                {preset.features.map((f, i) => (
                    <div key={i} className={styles.featureCard}>
                        <div className={styles.featureIcon}>
                            <FeatureIcon name={f.icon} size={20} />
                        </div>
                        <div>
                            <h3 className={styles.featureTitle}>{f.title}</h3>
                            <p className={styles.featureDesc}>{f.description}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Product Catalog with search/filter */}
            <ProductCatalog
                products={products.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    category: p.category,
                    image_url: p.image_url,
                    description: p.description,
                }))}
                subdomain={subdomain}
                currency={currency}
                catalogTitle={catalogTitle}
                page={page}
                hasMore={hasMore}
            />

            {/* Founder / CEO — only when the merchant has filled it in */}
            {founder && <FounderSection founder={founder} />}
        </div>
    );
}
