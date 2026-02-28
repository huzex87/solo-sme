'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductService, Product } from '@/services/productService';
import { OnboardingService } from '@/services/onboardingService';
import styles from './products.module.css';

// Using Product from services/productService

// Removing hardcoded DEMO_PRODUCTS to use ProductService

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        const data = await ProductService.getProducts('t1');
        setProducts(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSync = async () => {
        setLoading(true);
        try {
            const result = await OnboardingService.syncCatalog('https://instagram.com/demo-boutique');
            alert(`Catalog Sync Successful! 🔄\n${result.added} New product discovered, ${result.updated} prices updated.`);
            await fetchProducts();
        } catch (err) {
            alert('Sync failed. Please check your social media connection.');
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', ...new Set(products.map(p => p.category))];

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    return (
        <>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Products</h1>
                    <p className={styles.subtitle}>{products.length} items in your catalog</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={handleSync} disabled={loading}>
                        {loading ? '🔄 Syncing...' : '🔄 Sync with Social'}
                    </button>
                    <Link href="/dashboard/products/new" className="btn btn-primary">
                        + Add Product
                    </Link>
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchWrap}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
                <div className={styles.categoryTabs}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`btn btn-sm ${categoryFilter === cat ? 'btn-secondary' : 'btn-ghost'}`}
                            onClick={() => setCategoryFilter(cat)}
                        >
                            {cat === 'all' ? 'All' : cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.productGrid}>
                {filtered.map((product) => (
                    <div key={product.id} className={`card ${styles.productCard}`}>
                        <div className={styles.productImage}>
                            <span className={styles.productEmoji}>📦</span>
                        </div>
                        <div className={styles.productInfo}>
                            <span className={`badge badge-neutral`}>{product.category}</span>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <p className={styles.productDesc}>{product.description}</p>
                            <div className={styles.productMeta}>
                                <span className={styles.price}>₦{product.price.toLocaleString()}</span>
                                <span className={styles.stock}>
                                    {product.stock_quantity > 0 ? (
                                        <span className="badge badge-success">{product.stock_quantity} in stock</span>
                                    ) : (
                                        <span className="badge badge-error">Out of stock</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className={styles.emptyState}>
                    <span style={{ fontSize: '3rem' }}>🔍</span>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            )}
        </>
    );
}
