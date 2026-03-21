import { notFound } from 'next/navigation';
import { ProductService } from '@/services/productService';
import { TenantService } from '@/services/tenantService';
import { CurrencyService } from '@/services/currencyService';
import styles from '../../store.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { AddToCartButton } from '@/components/storefront/AddToCartButton';
import { ProductQRModal } from '@/components/storefront/ProductQRModal';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ subdomain: string; id: string }>;
}): Promise<Metadata> {
    const { subdomain, id } = await params;
    const tenant = await TenantService.getTenantBySubdomain(subdomain);
    const product = await ProductService.getProduct(id);

    if (!tenant || !product) return { title: 'Product Not Found | SOLO' };

    return {
        title: `${product.name} | ${tenant.name}`,
        description: product.description || `Buy ${product.name} from ${tenant.name} on SOLO.`,
        openGraph: {
            title: `${product.name} at ${tenant.name}`,
            description: product.description || `Check out this premium ${product.category} item.`,
            images: product.image_url ? [{ url: product.image_url }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | ${tenant.name}`,
            description: product.description || `Check out ${product.name}`,
            images: product.image_url ? [product.image_url] : [],
        }
    };
}

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ subdomain: string; id: string }>;
}) {
    const { subdomain, id } = await params;
    const tenant = await TenantService.getTenantBySubdomain(subdomain);

    if (!tenant) notFound();

    const product = await ProductService.getProduct(id);
    if (!product) notFound();

    // Mock related products
    const relatedProducts = (await ProductService.getProducts(tenant.id)).filter(p => p.id !== id).slice(0, 4);

    return (
        <div className={styles.productDetailContainer}>
            <div className={styles.breadcrumb}>
                <Link href={`/store/${subdomain}`}>Shop</Link>
                <span>/</span>
                <span>{product.name}</span>
            </div>

            <div className={styles.productHero}>
                <div className={styles.productGallery}>
                    <div className={styles.mainImage}>
                        {product.image_url ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        ) : (
                            <div className={styles.imagePlaceholder}>📦</div>
                        )}
                    </div>
                </div>

                <div className={styles.productInfo}>
                    <span className="badge badge-primary">{product.category}</span>
                    <h1 className={styles.productTitle}>{product.name}</h1>
                    <p className={styles.productPrice}>
                        {CurrencyService.format(
                            product.price,
                            tenant.currency || 'NGN'
                        )}
                    </p>

                    <div className={styles.productDescription}>
                        <h3>Description</h3>
                        <p>{product.description || "No description provided for this premium item."}</p>
                    </div>

                    <div className={styles.stockStatus}>
                        {product.stock_quantity > 0 ? (
                            <span style={{ color: 'var(--color-success)' }}>● In Stock ({product.stock_quantity} available)</span>
                        ) : (
                            <span style={{ color: 'var(--color-error)' }}>● Out of Stock</span>
                        )}
                    </div>

                    <div className={styles.productQRBtn}>
                        <AddToCartButton
                            productId={product.id}
                            productName={product.name}
                            price={product.price}
                            imageUrl={product.image_url}
                            stockQuantity={product.stock_quantity}
                        />
                        <ProductQRModal
                            productUrl={`https://${subdomain}.solosme.ng/product/${product.id}`}
                            productName={product.name}
                            storeName={tenant.name}
                        />
                    </div>

                    <div className={styles.trustBadges}>
                        <div className={styles.trustItem}>
                            <span>🛡️</span>
                            <p>Secure Payment</p>
                        </div>
                        <div className={styles.trustItem}>
                            <span>🚚</span>
                            <p>Fast Delivery</p>
                        </div>
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <section className={styles.relatedSection}>
                    <h2 className={styles.sectionTitle}>You might also like</h2>
                    <div className={styles.productGrid}>
                        {relatedProducts.map(p => (
                            <Link href={`/store/${subdomain}/product/${p.id}`} key={p.id} className={`card ${styles.productCard}`}>
                                <div className={styles.cardImage}>
                                    {p.image_url ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                            <Image
                                                src={p.image_url}
                                                alt={p.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                    ) : (
                                        <span>📦</span>
                                    )}
                                </div>
                                <div className={styles.cardInfo}>
                                    <h3 className={styles.cardTitle}>{p.name}</h3>
                                    <p className={styles.cardPrice}>
                                        {CurrencyService.format(
                                            p.price,
                                            tenant.currency || 'NGN'
                                        )}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
