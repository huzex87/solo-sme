'use client';

import { useState } from 'react';
import { ShoppingCart, Check, XCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface AddToCartButtonProps {
    productId: string;
    productName: string;
    price: number;
    imageUrl?: string;
    stockQuantity?: number;
}

export function AddToCartButton({ productId, productName, price, imageUrl, stockQuantity }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);
    const outOfStock = stockQuantity !== undefined && stockQuantity <= 0;

    const handleAdd = () => {
        if (outOfStock) return;
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
            disabled={outOfStock}
            className="btn btn-primary btn-lg"
            style={{
                width: '100%',
                marginTop: 'var(--space-xl)',
                opacity: outOfStock ? 0.5 : 1,
                cursor: outOfStock ? 'not-allowed' : 'pointer',
            }}
        >
            {outOfStock ? (
                <>
                    <XCircle size={20} className="mr-2" />
                    Out of Stock
                </>
            ) : added ? (
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
