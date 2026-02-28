'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './products.module.css';

interface Product {
    id: string;
    name: string;
    price: number;
    stock_quantity: number;
    category: string;
    description: string;
}

const DEMO_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Premium Wireless Headphones', price: 299.99, stock_quantity: 45, category: 'Electronics', description: 'Noise-cancelling over-ear headphones' },
    { id: 'p2', name: 'Artisan Leather Wallet', price: 89.00, stock_quantity: 120, category: 'Accessories', description: 'Handcrafted genuine leather wallet' },
    { id: 'p3', name: 'Organic Cotton T-Shirt', price: 45.00, stock_quantity: 200, category: 'Apparel', description: '100% organic cotton crew neck tee' },
    { id: 'p4', name: 'Smart Fitness Watch', price: 199.99, stock_quantity: 78, category: 'Electronics', description: 'Track heart rate, sleep, and exercises' },
    { id: 'p5', name: 'Minimalist Desk Lamp', price: 75.00, stock_quantity: 60, category: 'Home', description: 'Adjustable LED desk lamp' },
    { id: 'p6', name: 'Stainless Steel Water Bottle', price: 35.00, stock_quantity: 300, category: 'Accessories', description: 'Double-walled vacuum insulated' },
];

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        setProducts(DEMO_PRODUCTS);
    }, []);

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
                <Link href="/dashboard/products/new" className="btn btn-primary">
                    + Add Product
                </Link>
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
