'use client';

import { useCart } from '@/context/CartContext';
import styles from './store.module.css';

const PRODUCTS = [
    { id: 'p1', name: 'Premium Wireless Headphones', price: 299.99, category: 'Electronics', desc: 'Noise-cancelling with 30h battery' },
    { id: 'p2', name: 'Artisan Leather Wallet', price: 89.00, category: 'Accessories', desc: 'Handcrafted genuine leather' },
    { id: 'p3', name: 'Organic Cotton T-Shirt', price: 45.00, category: 'Apparel', desc: '100% organic cotton crew neck' },
    { id: 'p4', name: 'Smart Fitness Watch', price: 199.99, category: 'Electronics', desc: '50+ exercises, 7-day battery' },
    { id: 'p5', name: 'Minimalist Desk Lamp', price: 75.00, category: 'Home', desc: 'LED with wireless charging base' },
    { id: 'p6', name: 'Stainless Steel Water Bottle', price: 35.00, category: 'Accessories', desc: 'Vacuum insulated, 750ml' },
];

export default function StorePage() {
    const { addToCart } = useCart();

    return (
        <>
            <div className={styles.catalogHeader}>
                <h2 className={`gradient-text ${styles.catalogTitle}`}>Our Collection</h2>
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
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
