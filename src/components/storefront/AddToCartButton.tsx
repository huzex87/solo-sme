'use client';

import { useState } from 'react';
import { ShoppingCart, Check, XCircle, Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation';

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
    const [quantity, setQuantity] = useState(1);
    const params = useParams();
    const router = useRouter();
    const subdomain = params?.subdomain as string;

    const outOfStock = stockQuantity !== undefined && stockQuantity <= 0;

    const handleAdd = () => {
        if (outOfStock) return;
        addToCart({
            id: productId,
            name: productName,
            price,
            image_url: imageUrl,
        }, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (outOfStock) return;
        addToCart({
            id: productId,
            name: productName,
            price,
            image_url: imageUrl,
        }, quantity);
        if (subdomain) {
            router.push(`/store/${subdomain}/checkout`);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: 'var(--space-xl)', width: '100%' }}>
            {!outOfStock && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Quantity
                    </span>
                    <div style={{
                        display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)',
                        borderRadius: '12px', background: 'var(--surface)', padding: '2px'
                    }}>
                        <button
                            type="button"
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            style={{
                                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink)'
                            }}
                        >
                            <Minus size={14} />
                        </button>
                        <span style={{ minWidth: '32px', textAlign: 'center', fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => setQuantity(q => (stockQuantity === undefined || q < stockQuantity) ? q + 1 : q)}
                            style={{
                                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink)'
                            }}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={outOfStock}
                    className="btn btn-secondary btn-lg"
                    style={{
                        width: '100%',
                        opacity: outOfStock ? 0.5 : 1,
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        border: '1.5px solid var(--border)',
                        background: 'transparent',
                        color: 'var(--ink)'
                    }}
                >
                    {outOfStock ? (
                        <>
                            <XCircle size={20} />
                            Out of Stock
                        </>
                    ) : added ? (
                        <>
                            <Check size={20} />
                            Added to Cart
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={20} />
                            Add to Cart
                        </>
                    )}
                </button>

                {!outOfStock && (
                    <button
                        type="button"
                        onClick={handleBuyNow}
                        className="btn btn-primary btn-lg"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'var(--ink)',
                            color: '#fff'
                        }}
                    >
                        Buy Now
                    </button>
                )}
            </div>
        </div>
    );
}

