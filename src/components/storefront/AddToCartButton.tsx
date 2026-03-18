'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface AddToCartButtonProps {
    productId: string;
    productName: string;
    price: number;
    imageUrl?: string;
}

export function AddToCartButton({ productId, productName, price, imageUrl }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        addToCart({
            id: productId,
            name: productName,
            price,
            image_url: imageUrl,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button
            onClick={handleAdd}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 'var(--space-xl)' }}
        >
            {added ? (
                <>
                    <Check size={20} className="mr-2" />
                    Added to Cart
                </>
            ) : (
                <>
                    <ShoppingCart size={20} className="mr-2" />
                    Add to Cart
                </>
            )}
        </button>
    );
}
