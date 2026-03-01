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
                    <span className={styles.heroTagline}>Exclusively Curated</span>
                    <h1 className={`gradient-text ${styles.heroTitle}`}>
                        {tenant.name}: Elevate Your Everyday
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Discover our collection of premium, handcrafted products designed for the modern lifestyle. Quality meets artisan soul.
                    </p>
                    <div className={styles.heroActions}>
                        <a href="#catalog" className="btn btn-primary" style={{ backgroundColor: tenant.brand_color }}>
                            Shop Collection
                        </a>
                        <button className="btn btn-ghost">Our Story</button>
                    </div>
                </div>
            </section>

            <section className={styles.featuredSection}>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>✨</div>
                    <h3 className={styles.featureTitle}>Premium Quality</h3>
                    <p className={styles.featureDesc}>Every item is hand-selected for its exceptional craftsmanship and durability.</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>🌍</div>
                    <h3 className={styles.featureTitle}>Sustainable Soul</h3>
                    <p className={styles.featureDesc}>We partner with artisans who prioritize ethical and eco-friendly practices.</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.featureIcon}>⚡</div>
                    <h3 className={styles.featureTitle}>Swift Delivery</h3>
                    <p className={styles.featureDesc}>Experience world-class logistics with real-time tracking from our door to yours.</p>
                </div>
            </section>

            <div id="catalog" className={styles.catalogWrapper}>
                <div className={styles.catalogHeader}>
                    <h2 className={`gradient-text ${styles.catalogTitle}`}>{t.all} {t.categories}</h2>
                    <p className={styles.catalogSubtitle}>Meticulously crafted for excellence</p>
                </div>

                <div className={styles.productGrid}>
                    {products.map(product => (
                        <div key={product.id} className={styles.productCard}>
                            <div className={styles.productImageArea}>
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className={styles.productImage} />
                                ) : (
                                    <Package size={48} opacity={0.3} />
                                )}
                            </div>
                            <div className={styles.productDetails}>
                                <span className={styles.productCategory}>{product.category}</span>
                                <h3 className={styles.productName}>{product.name}</h3>
                                <div className={styles.productBottom}>
                                    <span className={styles.productPrice}>₦{product.price.toLocaleString()}</span>
                                    <button
                                        className={styles.addBtn}
                                        style={{ backgroundColor: tenant.brand_color }}
                                        onClick={() => addToCart({ id: product.id, name: product.name, price: product.price })}
                                    >
                                        {t.add_to_cart}
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
