'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ProductService, Product } from '@/services/productService';
import { OnboardingService } from '@/services/onboardingService';
import { useTenant } from '@/context/TenantContext';
import { useToast } from '@/components/ui/ToastProvider';
import { Plus, Search, RefreshCw, Edit, Trash2, Download } from 'lucide-react';
import styles from './products.module.css';
import EmptyState from '@/components/shared/EmptyState';
import { formatCurrency } from '@/lib/formatCurrency';
import { Package, Smartphone, Coffee, Sparkles, Home, ShoppingBag } from 'lucide-react';

import { exportToCSV } from '@/utils/csvExport';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    'Fashion': ShoppingBag,
    'Electronics': Smartphone,
    'Food': Coffee,
    'Beauty': Sparkles,
    'Home': Home,
    'Other': Package
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
                            <span className={styles.productIcon}>
                                {(() => {
                                    const Icon = CATEGORY_ICONS[product.category] || Package;
                                    return <Icon size={40} strokeWidth={1.5} color="var(--primary)" />;
                                })()}
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
                                <span className={`${styles.price} font-mono`}>{formatCurrency(product.price)}</span>
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
                <EmptyState
                    icon={ShoppingBag}
                    title={products.length === 0 ? "Your Inventory is Empty" : "No Matches Found"}
                    description={products.length === 0
                        ? "Your digital shelves are waiting to be filled. Start by adding your first product or syncing with social media."
                        : "We couldn't find any products matching your search. Try adjusting your filters or adding a new item."}
                    action={
                        <div className="flex gap-3">
                            <Link href="/dashboard/products/new" className="btn btn-primary">
                                Add Product
                            </Link>
                            {products.length === 0 && (
                                <button className="btn btn-secondary" onClick={handleSync}>
                                    Sync Social
                                </button>
                            )}
                        </div>
                    }
                />
            )}
        </>
    );
}
