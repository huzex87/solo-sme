'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductService, Product } from '@/services/productService';
import { OnboardingService } from '@/services/onboardingService';
import { useTenant } from '@/context/TenantContext';
import { useToast } from '@/components/ui/ToastProvider';
import { Plus, Search, RefreshCw, Edit, Trash2, Download } from 'lucide-react';
import styles from './products.module.css';

import { exportToCSV } from '@/utils/csvExport';

const STORE_EMOJIS: Record<string, string> = {
    'Fashion': '👗',
    'Electronics': '🔌',
    'Food': '🍲',
    'Beauty': '✨',
    'Home': '🏠',
    'Other': '📦'
};

export default function ProductsPage() {
    const { tenantId } = useTenant();
    const { showToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const data = await ProductService.getProducts(tenantId);
        setProducts(data);
        setLoading(false);
    }, [tenantId]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSync = async () => {
        setLoading(true);
        try {
            const result = await OnboardingService.syncCatalog('https://instagram.com/demo-boutique');
            showToast(`Catalog Sync Successful! Added ${result.added}, Updated ${result.updated}.`, 'success');
            await fetchProducts();
        } catch {
            showToast('Sync failed. Please check your social media connection.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        // Optimistic UI Update
        const previousProducts = [...products];
        setProducts(products.filter(p => p.id !== id));
        showToast(`Deleting ${name}...`, 'info');

        const success = await ProductService.deleteProduct(id);
        if (success) {
            showToast(`${name} deleted successfully`, 'success');
        } else {
            setProducts(previousProducts);
            showToast(`Failed to delete ${name}`, 'error');
        }
    };

    const handleExport = () => {
        exportToCSV(products as unknown as Record<string, unknown>[], 'SOLO_Product_Catalog');
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
                <div className={styles.headerActions}>
                    <button className="btn btn-ghost" onClick={handleExport} disabled={products.length === 0}>
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                    <button className="btn btn-secondary" onClick={handleSync} disabled={loading}>
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        <span>{loading ? 'Syncing...' : 'Sync with Social'}</span>
                    </button>
                    <Link href="/dashboard/products/new" className="btn btn-primary" style={{ minWidth: '140px' }}>
                        <Plus size={18} />
                        <span>Add Product</span>
                    </Link>
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchWrap}>
                    <div className={styles.searchIconWrapper}>
                        <Search size={18} strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '3rem' }}
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
                    <div key={product.id} className={`card ${styles.productCard} hover-lift`}>
                        <div className={styles.productImage}>
                            <span className={styles.productEmoji}>
                                {STORE_EMOJIS[product.category] || '📦'}
                            </span>
                        </div>
                        <div className={styles.productInfo}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span className={`badge badge-neutral`}>{product.category}</span>
                                <div className={styles.productActions}>
                                    <Link href={`/dashboard/products/${product.id}`} className="btn-icon">
                                        <Edit size={16} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id, product.name)}
                                        className="btn-icon"
                                        style={{ color: 'var(--color-error)' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
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
                    <div style={{ width: '200px', height: '200px', margin: '0 auto 2rem' }}>
                        <Image
                            src="/assets/branding/empty_products.png"
                            alt="No Products"
                            width={200}
                            height={200}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.8 }}
                        />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>No products found</h3>
                    <p style={{ color: 'var(--text-tertiary)', maxWidth: '300px', margin: '0.5rem auto' }}>
                        We couldn&apos;t find any products matching your search. Try adjusting your filters or add a new product!
                    </p>
                </div>
            )}
        </>
    );
}
