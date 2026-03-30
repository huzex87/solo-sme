'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, ShoppingBag, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencyService } from '@/services/currencyService';

interface ReorderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
    lastOrdered: string;
}

interface SmartReorderProps {
    subdomain: string;
    currency: string;
    onAddToCart: (items: ReorderItem[]) => void;
}

/**
 * Smart Reorder Widget for the storefront.
 * Shows previously ordered items and lets customers re-add them to cart in one click.
 * Uses localStorage per-store to remember past order items.
 */
export function SmartReorder({ subdomain, currency, onAddToCart }: SmartReorderProps) {
    const [pastItems, setPastItems] = useState<ReorderItem[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [reordered, setReordered] = useState(false);

    const storageKey = `solo_reorder_${subdomain}`;

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as ReorderItem[];
                if (parsed.length > 0) {
                    // Hydrate after mount to avoid cascading render warning
                    setTimeout(() => {
                        setPastItems(parsed);
                        setIsVisible(true);
                    }, 0);
                }
            } catch {
                // Ignore corrupted data
            }
        }
    }, [storageKey]);

    const handleReorder = () => {
        onAddToCart(pastItems);
        setReordered(true);
        setTimeout(() => setReordered(false), 3000);
    };

    const handleReorderSingle = (item: ReorderItem) => {
        onAddToCart([item]);
    };

    if (!isVisible || pastItems.length === 0) return null;

    const totalAmount = pastItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const lastDate = pastItems[0]?.lastOrdered
        ? new Date(pastItems[0].lastOrdered).toLocaleDateString()
        : '';

    return (
        <div className={cn(
            "border rounded-2xl p-5 transition-all duration-500 mb-6",
            reordered
                ? "bg-emerald-50 border-emerald-200"
                : "bg-gradient-to-r from-amber-50/50 to-orange-50/50 border-amber-200/50"
        )}>
            <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                    reordered ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                )}>
                    <RefreshCw size={18} className={reordered ? "animate-spin" : ""} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-950">Reorder Previous Items</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> Last ordered {lastDate}
                    </p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                >
                    Dismiss
                </button>
            </div>

            <div className="space-y-2 mb-4">
                {pastItems.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-1.5">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 overflow-hidden shrink-0">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                    <ShoppingBag size={16} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-xs font-bold text-slate-950 shrink-0">
                            {CurrencyService.format(item.price * item.quantity, currency)}
                        </p>
                        <button
                            onClick={() => handleReorderSingle(item)}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={handleReorder}
                disabled={reordered}
                className={cn(
                    "w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                    reordered
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-950 text-white hover:bg-slate-800 shadow-lg"
                )}
            >
                {reordered ? (
                    <>Added to Cart!</>
                ) : (
                    <>
                        <RefreshCw size={16} />
                        Reorder All ({CurrencyService.format(totalAmount, currency)})
                    </>
                )}
            </button>
        </div>
    );
}

/**
 * Saves order items for future reorder suggestions.
 * Called after a successful checkout.
 */
export function saveReorderHistory(
    subdomain: string,
    items: { id: string; name: string; price: number; quantity: number; image_url?: string }[]
) {
    const storageKey = `solo_reorder_${subdomain}`;
    const reorderItems: ReorderItem[] = items.map(item => ({
        ...item,
        lastOrdered: new Date().toISOString(),
    }));
    localStorage.setItem(storageKey, JSON.stringify(reorderItems));
}
