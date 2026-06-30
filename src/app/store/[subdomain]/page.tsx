import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import styles from './store.module.css';
import { ProductService } from '@/services/productService';
import { TenantService } from '@/services/tenantService';
import { createClient } from '@/lib/supabase/server';
import ProductCatalog from '@/components/storefront/ProductCatalog';

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
            images: tenant.logo_url ? [{ url: tenant.logo_url }] : [],
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

    // Tenant-configurable feature cards — fall back to neutral defaults if not set
    const featureCards: Array<{ title: string; description: string; icon: string }> = branding.features || [
        { icon: '✓', title: 'Verified Quality', description: 'Every product is carefully reviewed before listing.' },
        { icon: '⚡', title: 'Fast Delivery', description: 'Nationwide shipping to all states across Nigeria.' },
        { icon: '💬', title: 'WhatsApp Support', description: 'Reach us anytime for help with your order.' },
    ];

    const heroTitle: string = branding.hero?.title || tenant.name;
    const heroSubtitle: string = branding.hero?.subtitle || `Welcome to ${tenant.name}. Browse and shop securely.`;
    const catalogTitle: string = branding.catalog_title || 'Our Products';

    const hasMore = products.length === PRODUCTS_PER_PAGE;

    return (
        <div className="animate-entrance">
            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>{heroTitle}</h1>
                    <p className={styles.heroSubtitle}>{heroSubtitle}</p>
                    <div className="flex gap-4 justify-center">
                        <Link href="#catalog" className="btn btn-primary px-8">
                            <ShoppingCart size={18} className="mr-2" />
                            Shop Now
                        </Link>
                    </div>
                    <div className={styles.heroTrust}>
                        <div className={styles.heroTrustItem}><span>🔒</span> Secure Checkout</div>
                        <div className={styles.heroTrustItem}><span>⚡</span> Fast Delivery</div>
                        <div className={styles.heroTrustItem}><span>💬</span> WhatsApp Support</div>
                    </div>
                </div>
            </section>

            {/* Feature Cards — configurable per tenant */}
            {featureCards.length > 0 && (
                <section className={styles.featuredSection}>
                    {featureCards.map((card, i) => (
                        <div key={i} className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
                            </div>
                            <div>
                                <h3 className={styles.featureTitle}>{card.title}</h3>
                                <p className={styles.featureDesc}>{card.description}</p>
                            </div>
                        </div>
                    ))}
                </section>
            )}

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
        </div>
    );
}
