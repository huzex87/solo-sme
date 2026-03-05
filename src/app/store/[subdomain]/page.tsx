'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, ArrowRight, Loader2, Package, Award, Globe, Gem, ShoppingCart, Info, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { getTranslation, Locale } from '@/lib/i18n';
import styles from './store.module.css';
import { ProductService, Product } from '@/services/productService';
import { TenantService, Tenant } from '@/services/tenantService';
import { LocaleService } from '@/services/localeService';

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
                <Link href="/" className="btn btn-primary">Return Home</Link>
            </div>
        );
    }

    return (
        <>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle} style={{ color: tenant.branding_config?.primaryColor || '#7c4dff' }}>
                        {tenant.branding_config?.hero?.title || tenant.name}
                    </h1>
                    <p className={styles.heroSubtitle}>
                        {tenant.branding_config?.hero?.subtitle || 'Discover quality products at great prices. Shop with confidence.'}
                    </p>
                    <div className={styles.heroActions} style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
                        <Link href="#products" className="btn btn-primary" style={{ backgroundColor: tenant.branding_config?.primaryColor || '#7c4dff', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <ShoppingCart size={18} />
                            {tenant.branding_config?.hero?.ctaText || 'See All Products'}
                        </Link>
                        <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Info size={18} />
                            Our Story
                        </button>
                    </div>
                </div>
            </section>

            <section className={styles.featuredSection}>
                <div className={styles.featureCard}>
                    <Award className={styles.featureIcon} size={24} />
                    <h3 className={styles.featureTitle}>Unrivaled Quality</h3>
                    <p className={styles.featureDesc}>Meticulously sourced materials for the discerning individual.</p>
                </div>
                <div className={styles.featureCard}>
                    <Globe className={styles.featureIcon} size={24} />
                    <h3 className={styles.featureTitle}>Fast Shipping</h3>
                    <p className={styles.featureDesc}>Safe and reliable delivery for all your orders.</p>
                </div>
                <div className={styles.featureCard}>
                    <Gem className={styles.featureIcon} size={24} />
                    <h3 className={styles.featureTitle}>Quality Items</h3>
                    <p className={styles.featureDesc}>Carefully selected products made with great care.</p>
                </div>
            </section>

            <div id="products" className={styles.catalogWrapper}>
                <div className={styles.catalogHeader} style={{ textAlign: 'left', marginBottom: '40px' }}>
                    <h2 className={styles.catalogTitle}>Our Products</h2>
                    <div style={{ height: '2px', width: '40px', background: 'var(--accent-primary)', marginTop: '8px' }}></div>
                </div>

                <div className={styles.productGrid}>
                    {(products || []).map((product: Product) => (
                        product && product.id && (
                            <div key={product.id} className={styles.productCard}>
                                <div className={styles.productImageArea}>
                                    {product.image_url ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} className={styles.productImage} />
                                        </div>
                                    ) : (
                                        <Package size={40} strokeWidth={1} style={{ opacity: 0.2 }} />
                                    )}
                                </div>
                                <div className={styles.productDetails}>
                                    <span className={styles.productCategory}>{product.category}</span>
                                    <h3 className={styles.productName}>{product.name}</h3>
                                    <div className={styles.productBottom}>
                                        <span className={styles.productPrice}>{LocaleService.formatCurrency(product.price || 0, tenant)}</span>
                                        <button
                                            className="btn btn-sm"
                                            style={{ backgroundColor: tenant.branding_config?.primaryColor || '#7c4dff', color: '#fff', borderRadius: tenant.branding_config?.borderRadius || '8px' }}
                                            onClick={() => addToCart({ id: product.id, name: product.name, price: product.price || 0 })}
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                    {products.length === 0 && (
                        <div className={styles.emptyCatalog}>
                            <Package size={48} />
                            <h3>No products yet</h3>
                            <p>We are currently updating our products. Please check back soon.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
