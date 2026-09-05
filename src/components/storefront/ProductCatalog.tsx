'use client';

import { useState, useMemo } from 'react';
import { Package, ChevronRight, Search, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { QuickAddButton } from './QuickAddButton';
import { CurrencyService } from '@/services/currencyService';
import styles from '@/app/store/[subdomain]/store.module.css';

interface Product {
    id: string;
    name: string;
    price: number | null;
    category?: string | null;
    image_url?: string | null | undefined;
    description?: string | null;
}

interface ProductCatalogProps {
    products: Product[];
    subdomain: string;
    currency: string;
    catalogTitle: string;
    page: number;
    hasMore: boolean;
}

export default function ProductCatalog({
    products,
    subdomain,
    currency,
    catalogTitle,
    page,
    hasMore,
}: ProductCatalogProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = useMemo(() => {
        const cats = new Set<string>();
        products.forEach(p => {
            if (p.category) cats.add(p.category);
        });
        return Array.from(cats).sort();
    }, [products]);

    const filtered = useMemo(() => {
        let result = products;
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q)
            );
        }
        if (selectedCategory) {
            result = result.filter(p => p.category === selectedCategory);
        }
        return result;
    }, [products, search, selectedCategory]);

    const showFilters = products.length > 4;

    return (
        <div id="catalog" className={styles.catalogWrapper}>
            <div className={styles.catalogHeader}>
                <div>
                    <span className={styles.catEyebrow}>Browse</span>
                    <h2 className={styles.catalogTitle}>{catalogTitle}</h2>
                </div>
                <span className={styles.catCount}>
                    {page > 1 ? `Page ${page}` : `${products.length} item${products.length !== 1 ? 's' : ''}`}
                </span>
            </div>

            {/* Search & Category Filter */}
            {showFilters && (
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100"
                            >
                                <X size={14} className="text-slate-400" />
                            </button>
                        )}
                    </div>
                    {categories.length > 1 && (
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                                    !selectedCategory
                                        ? 'bg-[var(--ink)] text-white'
                                        : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                }`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                                        selectedCategory === cat
                                            ? 'bg-[var(--ink)] text-white'
                                            : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {filtered.length === 0 ? (
                <div className={styles.catalogEmpty}>
                    <span className={styles.catalogEmptyIcon}><Package size={26} /></span>
                    <h3>
                        {search || selectedCategory
                            ? 'No products match your search'
                            : page > 1 ? 'No more products' : 'Currently restocking'}
                    </h3>
                    <p>
                        {search || selectedCategory ? (
                            <button
                                onClick={() => { setSearch(''); setSelectedCategory(null); }}
                            >
                                Clear filters
                            </button>
                        ) : page > 1 ? (
                            <Link href={`/store/${subdomain}`}>
                                Back to first page
                            </Link>
                        ) : 'New pieces are on the way — check back soon.'}
                    </p>
                </div>
            ) : (
                <>
                    {(search || selectedCategory) && (
                        <p className="text-sm text-slate-500 font-medium mb-4">
                            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
                        </p>
                    )}
                    <div className={styles.productGrid}>
                        {filtered.map((product) => (
                            <div key={product.id} className={styles.productCard}>
                                <div className={styles.productImageArea}>
                                    <Link href={`/store/${subdomain}/product/${product.id}`} className="absolute inset-0 w-full h-full z-0 block">
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                style={{ objectFit: 'cover' }}
                                                className="transition-transform duration-500 hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                                <Package size={40} className="opacity-10" />
                                            </div>
                                        )}
                                    </Link>
                                    {product.category && (
                                        <span className={styles.categoryBadge} style={{ zIndex: 1 }}>{product.category}</span>
                                    )}
                                    <div className={styles.quickAddOverlay} style={{ zIndex: 2 }}>
                                        <QuickAddButton
                                            productId={product.id}
                                            productName={product.name}
                                            price={product.price || 0}
                                            imageUrl={product.image_url ?? undefined}
                                        />
                                    </div>
                                </div>
                                <div className={styles.productDetails}>
                                    <Link href={`/store/${subdomain}/product/${product.id}`} className="block hover:underline">
                                        <h3 className={styles.productName}>{product.name}</h3>
                                    </Link>
                                    <div className={styles.productBottom}>
                                        <span className={styles.productPrice}>
                                            {CurrencyService.format(
                                                CurrencyService.convert(product.price || 0, 'NGN', currency),
                                                currency
                                            )}
                                        </span>
                                        <Link
                                            href={`/store/${subdomain}/product/${product.id}`}
                                            className={styles.cardAddBtn}
                                            aria-label={`View ${product.name}`}
                                        >
                                            <ChevronRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination — only show when not filtering */}
                    {!search && !selectedCategory && (
                        <div className="flex items-center justify-center gap-4 mt-12 pb-8">
                            {page > 1 && (
                                <Link
                                    href={`/store/${subdomain}?page=${page - 1}`}
                                    className="btn btn-ghost border border-slate-200 rounded-2xl px-8 h-12 font-bold"
                                >
                                    Previous
                                </Link>
                            )}
                            {hasMore && (
                                <Link
                                    href={`/store/${subdomain}?page=${page + 1}`}
                                    className="btn btn-primary rounded-2xl px-8 h-12 font-bold flex items-center gap-2"
                                >
                                    Next Page
                                    <ChevronRight size={16} />
                                </Link>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
