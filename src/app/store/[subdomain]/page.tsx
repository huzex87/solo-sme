import { Package, ShoppingCart, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './store.module.css';
import { ProductService, Product } from '@/services/productService';
import { TenantService } from '@/services/tenantService';
import { CurrencyService } from '@/services/currencyService';
import { createClient } from '@/lib/supabase/server';

const PRODUCTS_PER_PAGE = 24;

interface PageProps {
    params: Promise<{ subdomain: string }>;
    searchParams: Promise<{ page?: string }>;
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
        { icon: '✓', title: 'Verified Quality', description: 'Every product is reviewed before listing.' },
        { icon: '🚚', title: 'Nationwide Delivery', description: 'We ship to all states across Nigeria.' },
        { icon: '💬', title: 'WhatsApp Support', description: 'Message us anytime for help with your order.' },
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
                </div>
            </section>

            {/* Feature Cards — configurable per tenant */}
            {featureCards.length > 0 && (
                <section className={styles.featuredSection}>
                    {featureCards.map((card, i) => (
                        <div key={i} className={styles.featureCard}>
                            <span className="text-3xl mb-2 block">{card.icon}</span>
                            <h3 className={styles.featureTitle}>{card.title}</h3>
                            <p className={styles.featureDesc}>{card.description}</p>
                        </div>
                    ))}
                </section>
            )}

            {/* Product Catalog */}
            <div id="catalog" className={styles.catalogWrapper}>
                <div className={styles.catalogHeader}>
                    <h2 className={styles.catalogTitle}>{catalogTitle}</h2>
                    {page > 1 && (
                        <span className="text-sm text-slate-400 font-semibold">Page {page}</span>
                    )}
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Package size={48} className="mx-auto mb-4" />
                        <h3 className="text-xl font-black">
                            {page > 1 ? 'No more products' : 'Currently Restocking'}
                        </h3>
                        <p>
                            {page > 1
                                ? <Link href={`/store/${subdomain}`} className="text-primary underline">Back to first page</Link>
                                : 'Check back soon.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className={styles.productGrid}>
                            {products.map((product: Product) => (
                                <div key={product.id} className={styles.productCard}>
                                    <div className={styles.productImageArea}>
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                style={{ objectFit: 'cover' }}
                                                className="transition-transform duration-500 hover:scale-110"
                                            />
                                        ) : (
                                            <Package size={40} className="opacity-10" />
                                        )}
                                    </div>
                                    <div className={styles.productDetails}>
                                        <span className={styles.productCategory}>{product.category || 'General'}</span>
                                        <h3 className={styles.productName}>{product.name}</h3>
                                        <div className={styles.productBottom}>
                                            <span className={styles.productPrice}>
                                                {CurrencyService.format(
                                                    CurrencyService.convert(product.price || 0, 'NGN', currency),
                                                    currency
                                                )}
                                            </span>
                                            <Link
                                                href={`/store/${subdomain}/products/${product.id}`}
                                                className="btn btn-primary btn-sm rounded-xl px-4"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-center gap-4 mt-12 pb-8">
                            {page > 1 && (
                                <Link
                                    href={`/store/${subdomain}?page=${page - 1}`}
                                    className="btn btn-ghost border border-slate-200 rounded-2xl px-8 h-12 font-bold"
                                >
                                    Previous
                                </Link>
                            )}
                            {hasMore && (
                                <Link
                                    href={`/store/${subdomain}?page=${page + 1}`}
                                    className="btn btn-primary rounded-2xl px-8 h-12 font-bold flex items-center gap-2"
                                >
                                    Next Page
                                    <ChevronRight size={16} />
                                </Link>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
