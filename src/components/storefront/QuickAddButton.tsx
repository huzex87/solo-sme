'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface QuickAddButtonProps {
    productId: string;
    productName: string;
    price: number;
    imageUrl?: string;
}

export function QuickAddButton({ productId, productName, price, imageUrl }: QuickAddButtonProps) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ id: productId, name: productName, price, image_url: imageUrl });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <button
            onClick={handleAdd}
            style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: 'none',
                background: added ? 'var(--success)' : 'var(--ink)',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all .2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            title="Add to cart"
        >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
        </button>
    );
}
