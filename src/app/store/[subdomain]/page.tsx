'use client';

import { useCart } from '@/context/CartContext';
import { getTranslation, Locale } from '@/lib/i18n';
import styles from './store.module.css';

const PRODUCTS = [
    { id: 'p1', name: 'Premium Wireless Headphones', price: 299000, category: 'Electronics', desc: 'Noise-cancelling with 30h battery' },
    { id: 'p2', name: 'Artisan Leather Wallet', price: 89000, category: 'Accessories', desc: 'Handcrafted genuine leather' },
    { id: 'p3', name: 'Organic Cotton T-Shirt', price: 45000, category: 'Apparel', desc: '100% organic cotton crew neck' },
    { id: 'p4', name: 'Smart Fitness Watch', price: 199000, category: 'Electronics', desc: '50+ exercises, 7-day battery' },
    { id: 'p5', name: 'Minimalist Desk Lamp', price: 75000, category: 'Home', desc: 'LED with wireless charging base' },
    { id: 'p6', name: 'Stainless Steel Water Bottle', price: 35000, category: 'Accessories', desc: 'Vacuum insulated, 750ml' },
];

export default function StorePage() {
    const { addToCart, locale } = useCart();
    const t = getTranslation(locale as Locale);

    return (
        <>
            <div className={styles.catalogHeader}>
                <h2 className={`gradient-text ${styles.catalogTitle}`}>{t.all} {t.categories}</h2>
                <p className={styles.catalogSubtitle}>Curated premium products for you</p>
            </div>

            <div className={styles.productGrid}>
                {PRODUCTS.map(product => (
                    <div key={product.id} className={styles.productCard}>
                        <div className={styles.productImageArea}>📦</div>
                        <div className={styles.productDetails}>
                            <span className={styles.productCategory}>{product.category}</span>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <div className={styles.productBottom}>
                                <span className={styles.productPrice}>₦{product.price.toLocaleString()}</span>
                                <button
                                    className={styles.addBtn}
                                    onClick={() => addToCart({ id: product.id, name: product.name, price: product.price })}
                                >
                                    {t.add_to_cart}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
