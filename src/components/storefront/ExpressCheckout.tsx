'use client';

import { useState, useEffect } from 'react';
import { Zap, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedCustomer {
    name: string;
    email: string;
    phone: string;
    address?: string;
    lastUsed: string;
}

interface ExpressCheckoutProps {
    onApply: (customer: SavedCustomer) => void;
    subdomain: string;
}

/**
 * Express Checkout for returning customers.
 * Saves customer info in localStorage (per-store) for faster repeat purchases.
 */
export function ExpressCheckout({ onApply, subdomain }: ExpressCheckoutProps) {
    const [savedCustomer, setSavedCustomer] = useState<SavedCustomer | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [applied, setApplied] = useState(false);

    const storageKey = `solo_express_${subdomain}`;

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as SavedCustomer;
                // Hydrate after mount to avoid cascading render warning
                setTimeout(() => setSavedCustomer(parsed), 0);
            } catch {
                localStorage.removeItem(storageKey);
            }
        }
    }, [storageKey]);

    const handleApply = () => {
        if (!savedCustomer) return;
        onApply(savedCustomer);
        setApplied(true);

        // Update last used timestamp
        const updated = { ...savedCustomer, lastUsed: new Date().toISOString() };
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const handleClear = () => {
        localStorage.removeItem(storageKey);
        setSavedCustomer(null);
        setApplied(false);
    };

    if (!savedCustomer) return null;

    return (
        <div className={cn(
            "border rounded-2xl p-4 transition-all duration-300 mb-4",
            applied
                ? "bg-emerald-50 border-emerald-200"
                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
        )}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-3"
            >
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                    applied ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                )}>
                    {applied ? <Check size={18} /> : <Zap size={18} />}
                </div>
                <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-slate-950">
                        {applied ? 'Express Details Applied' : 'Express Checkout Available'}
                    </p>
                    <p className="text-xs text-slate-500">
                        Welcome back, {savedCustomer.name.split(' ')[0]}!
                    </p>
                </div>
                {!applied && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleApply(); }}
                        className="h-9 px-4 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors active:scale-95"
                    >
                        Use My Info
                    </button>
                )}
                {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 space-y-2 animate-entrance">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Name</span>
                            <p className="font-semibold text-slate-700">{savedCustomer.name}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Email</span>
                            <p className="font-semibold text-slate-700">{savedCustomer.email}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Phone</span>
                            <p className="font-semibold text-slate-700">{savedCustomer.phone}</p>
                        </div>
                        {savedCustomer.address && (
                            <div>
                                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Address</span>
                                <p className="font-semibold text-slate-700 truncate">{savedCustomer.address}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleClear}
                        className="text-[11px] font-semibold text-rose-500 hover:underline mt-1"
                    >
                        Clear saved info
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Utility to save customer info after a successful checkout.
 */
export function saveExpressCustomer(subdomain: string, customer: { name: string; email: string; phone: string; address?: string }) {
    const storageKey = `solo_express_${subdomain}`;
    const data: SavedCustomer = {
        ...customer,
        lastUsed: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
}
