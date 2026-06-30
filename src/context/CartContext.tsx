'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>, quantityToAdd?: number) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    locale: string;
    setLocale: (locale: string) => void;
    currency: string;
    setCurrency: (currency: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem('solo-cart');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    useEffect(() => {
        try { localStorage.setItem('solo-cart', JSON.stringify(items)); } catch {}
    }, [items]);

    const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantityToAdd: number = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantityToAdd } : i);
            }
            return [...prev, { ...item, quantity: quantityToAdd }];
        });
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity <= 0) {
            setItems(prev => prev.filter(i => i.id !== id));
        } else {
            setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
        }
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const [locale, setLocale] = useState('en');
    const [currency, setCurrency] = useState('NGN');

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    return (
        <CartContext.Provider value={{
            items, addToCart, removeFromCart, updateQuantity, clearCart,
            totalItems, totalPrice, locale, setLocale, currency, setCurrency
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}
