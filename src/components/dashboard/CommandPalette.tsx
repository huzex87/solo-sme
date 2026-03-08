'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Users, ClipboardList, LayoutDashboard, Sparkles, Plus, Send } from 'lucide-react';
import styles from './CommandPalette.module.css';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/context/TenantContext';

interface SearchResult {
    id: string;
    name: string;
    type: 'product' | 'order' | 'customer' | 'page';
    href: string;
    subtitle?: string;
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const { tenantId } = useTenant();

    const STATIC_PAGES: SearchResult[] = [
        { id: 'p1', name: 'Overview Dashboard', type: 'page', href: '/dashboard', subtitle: 'Business stats & recent activity' },
        { id: 'p2', name: 'Unified Hub', type: 'page', href: '/dashboard/hub', subtitle: 'All-in-one messaging' },
        { id: 'p3', name: 'Product Management', type: 'page', href: '/dashboard/products', subtitle: 'Edit and manage catalog' },
        { id: 'p4', name: 'Order History', type: 'page', href: '/dashboard/orders', subtitle: 'Process fulfillment' },
        { id: 'p5', name: 'Customer Database', type: 'page', href: '/dashboard/customers', subtitle: 'CRM & loyalty' },
        { id: 'p6', name: 'Marketing Content Lab', type: 'page', href: '/dashboard/content', subtitle: 'AI generated social posts' },
        { id: 'p7', name: 'Store Settings', type: 'page', href: '/dashboard/settings', subtitle: 'Personalization & branding' },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
            // Quick Action Shortcuts when palette is closed
            if (!isOpen && e.target instanceof HTMLBodyElement) {
                if (e.key === 'n') {
                    router.push('/dashboard/products/new');
                }
                if (e.key === 'h') {
                    router.push('/dashboard/hub');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, router]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            const timer = setTimeout(() => setQuery(''), 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults(STATIC_PAGES);
                return;
            }

            const searchFilter = query.toLowerCase();
            const filteredPages = STATIC_PAGES.filter(p =>
                p.name.toLowerCase().includes(searchFilter) ||
                p.subtitle?.toLowerCase().includes(searchFilter)
            );

            // Search Products
            const { data: dbProducts } = await supabase
                .from('products')
                .select('id, name, price')
                .eq('tenant_id', tenantId)
                .ilike('name', `%${query}%`)
                .limit(3);

            const productResults: SearchResult[] = (dbProducts || []).map(p => ({
                id: p.id,
                name: p.name,
                type: 'product',
                href: `/dashboard/products/${p.id}`,
                subtitle: `₦${p.price.toLocaleString()}`
            }));

            // Search Orders
            const { data: dbOrders } = await supabase
                .from('orders')
                .select('id, customer_name, total_amount')
                .eq('tenant_id', tenantId)
                .ilike('customer_name', `%${query}%`)
                .limit(2);

            const orderResults: SearchResult[] = (dbOrders || []).map(o => ({
                id: o.id,
                name: `Order from ${o.customer_name}`,
                type: 'order',
                href: `/dashboard/orders/${o.id}`,
                subtitle: `₦${o.total_amount.toLocaleString()}`
            }));

            setResults([...filteredPages, ...productResults, ...orderResults]);
            setActiveIndex(0);
        };

        const timer = setTimeout(fetchResults, 150);
        return () => clearTimeout(timer);
    }, [query, tenantId]);

    const handleSelect = (href: string) => {
        router.push(href);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            if (results[activeIndex]) {
                handleSelect(results[activeIndex].href);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
            <div className={styles.palette} onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
                <div className={styles.searchHeader}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        ref={inputRef}
                        className={styles.input}
                        placeholder="Search anything (e.g. 'Orders', 'AI', 'Silk Scarf')..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <kbd className={styles.esc}>ESC</kbd>
                </div>

                <div className={styles.results}>
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>{query ? 'Search Results' : 'Quick Actions'}</div>
                        {results.length > 0 ? (
                            results.map((item, idx) => (
                                <button
                                    key={item.id}
                                    className={`${styles.resultItem} ${idx === activeIndex ? styles.resultItemActive : ''}`}
                                    onClick={() => handleSelect(item.href)}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                >
                                    <div className={styles.itemIcon}>
                                        {item.type === 'page' && <LayoutDashboard size={18} />}
                                        {item.type === 'product' && <Package size={18} />}
                                        {item.type === 'order' && <ClipboardList size={18} />}
                                        {item.type === 'customer' && <Users size={18} />}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <span className={styles.itemSub}>{item.subtitle}</span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className={styles.empty}>
                                <Sparkles size={32} style={{ opacity: 0.5 }} />
                                <p>No results found for &quot;{query}&quot;</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
