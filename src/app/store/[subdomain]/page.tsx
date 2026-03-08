'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Package, Award, Globe, Gem, ShoppingCart, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { getTranslation, Locale } from '@/lib/i18n';
import styles from './store.module.css';
import { ProductService, Product } from '@/services/productService';
import { TenantService, Tenant } from '@/services/tenantService';
import { CurrencyService } from '@/services/currencyService';

export default function StorePage() {
    const { addToCart, locale, currency } = useCart();
    const t = getTranslation(locale as Locale);
    const params = useParams();
    const subdomain = params.subdomain as string;

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStoreContent() {
            try {
                setLoading(true);
                const tenantData = await TenantService.getTenantBySubdomain(subdomain);
                if (tenantData) {
                    setTenant(tenantData);
                    const productsData = await ProductService.getProducts(tenantData.id);
                    setProducts(productsData);
                }
            } catch (err) {
                console.error('Failed to load store content:', err);
            } finally {
                setLoading(false);
            }
        }

        if (subdomain) {
            fetchStoreContent();
        }
    }, [subdomain]);

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
                <p>Opening store doors...</p>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className={styles.errorState}>
                <h1>404</h1>
                <p>Store not found in our directory.</p>
                <Link href="/" className="btn btn-primary">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="animate-entrance">
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        {tenant.branding_config?.hero?.title || tenant.name}
                    </h1>
                    <p className={styles.heroSubtitle}>
                        {tenant.branding_config?.hero?.subtitle || 'Premium Nigerian commerce experience, precisely crafted for you.'}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="#catalog" className="btn btn-primary px-8">
                            <ShoppingCart size={18} className="mr-2" />
                            Secure Shop
                        </Link>
                    </div>
                </div>
            </section>

            <section className={styles.featuredSection}>
                <div className={styles.featureCard}>
                    <Award className={styles.featureIcon} size={32} />
                    <h3 className={styles.featureTitle}>Institutional Quality</h3>
                    <p className={styles.featureDesc}>Sourced and verified for the highest standards.</p>
                </div>
                <div className={styles.featureCard}>
                    <Globe className={styles.featureIcon} size={32} />
                    <h3 className={styles.featureTitle}>National Logistics</h3>
                    <p className={styles.featureDesc}>Integrated shipping across all 36 states.</p>
                </div>
                <div className={styles.featureCard}>
                    <Gem className={styles.featureIcon} size={32} />
                    <h3 className={styles.featureTitle}>Sovereign Support</h3>
                    <p className={styles.featureDesc}>Dedicated concierge for every transaction.</p>
                </div>
            </section>

            <div id="catalog" className={styles.catalogWrapper}>
                <div className={styles.catalogHeader}>
                    <h2 className={styles.catalogTitle}>Curated Intelligence</h2>
                </div>

                <div className={styles.productGrid}>
                    {(products || []).map((product: Product) => (
                        <div key={product.id} className={styles.productCard}>
                            <div className={styles.productImageArea}>
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
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
                                    <button
                                        className="btn btn-primary btn-sm rounded-xl px-4"
                                        onClick={() => addToCart({ id: product.id, name: product.name, price: product.price || 0 })}
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <Package size={48} className="mx-auto mb-4" />
                        <h3 className="text-xl font-black">Vault Empty</h3>
                        <p>This merchant is currently restocking.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
