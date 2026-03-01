'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { getTranslation, Locale } from '@/lib/i18n';
import styles from './store.module.css';
import { ProductService, Product } from '@/services/productService';
import { TenantService, Tenant } from '@/services/tenantService';
import { Loader2, Package } from 'lucide-react';

export default function StorePage() {
    const { addToCart, locale } = useCart();
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
                <a href="/" className="btn btn-primary">Return Home</a>
            </div>
        );
    }

    return (
        <>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        {tenant.name}
                    </h1>
                    <p className={styles.heroSubtitle}>
                        A sanctuary of curated excellence. Discover premium objects designed to elevate your everyday experience.
                    </p>
                    <div className={styles.heroActions}>
                        <a href="#catalog" className="btn btn-primary" style={{ backgroundColor: tenant.brand_color }}>
                            Explore Collection
                        </a>
                        <button className="btn btn-secondary">Our Philosophy</button>
                    </div>
                </div>
            </section>

            <section className={styles.featuredSection}>
                <div className={styles.featureCard}>
                    <span className={styles.featureIcon}>✦</span>
                    <h3 className={styles.featureTitle}>Unrivaled Quality</h3>
                    <p className={styles.featureDesc}>Meticulously sourced materials for the discerning individual.</p>
                </div>
                <div className={styles.featureCard}>
                    <span className={styles.featureIcon}>✦</span>
                    <h3 className={styles.featureTitle}>Global Dispatch</h3>
                    <p className={styles.featureDesc}>Seamless logistics ensuring your collection arrives in perfect state.</p>
                </div>
                <div className={styles.featureCard}>
                    <span className={styles.featureIcon}>✦</span>
                    <h3 className={styles.featureTitle}>Artisan Legacy</h3>
                    <p className={styles.featureDesc}>Honoring traditional craftsmanship through modern design.</p>
                </div>
            </section>

            <div id="catalog" className={styles.catalogWrapper}>
                <div className={styles.catalogHeader} style={{ textAlign: 'left', marginBottom: '40px' }}>
                    <h2 className={styles.catalogTitle}>{t.all} {t.categories}</h2>
                    <div style={{ height: '2px', width: '40px', background: 'var(--accent-primary)', marginTop: '8px' }}></div>
                </div>

                <div className={styles.productGrid}>
                    {products.map(product => (
                        <div key={product.id} className={styles.productCard}>
                            <div className={styles.productImageArea}>
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className={styles.productImage} />
                                ) : (
                                    <Package size={40} strokeWidth={1} style={{ opacity: 0.2 }} />
                                )}
                            </div>
                            <div className={styles.productDetails}>
                                <span className={styles.productCategory}>{product.category}</span>
                                <h3 className={styles.productName}>{product.name}</h3>
                                <div className={styles.productBottom}>
                                    <span className={styles.productPrice}>₦{product.price.toLocaleString()}</span>
                                    <button
                                        className="btn btn-sm"
                                        style={{ backgroundColor: tenant.brand_color, color: '#000', borderRadius: '4px' }}
                                        onClick={() => addToCart({ id: product.id, name: product.name, price: product.price })}
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div className={styles.emptyCatalog}>
                            <Package size={48} />
                            <h3>Catalog Empty</h3>
                            <p>We're currently updating our collection. Please check back soon.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
