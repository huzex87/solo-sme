'use client';

import { useState } from 'react';
import { ShoppingCart, Check, XCircle, Minus, Plus, MessageCircle, Users } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AddToCartButtonProps {
    productId: string;
    productName: string;
    price: number;
    imageUrl?: string;
    stockQuantity?: number;
    whatsappNumber?: string;
    storeName?: string;
}

export function AddToCartButton({ 
    productId, 
    productName, 
    price, 
    imageUrl, 
    stockQuantity,
    whatsappNumber,
    storeName
}: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const params = useParams();
    const router = useRouter();
    const subdomain = params?.subdomain as string;
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupBuyCode, setGroupBuyCode] = useState('');

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

    const handleWhatsAppOrder = () => {
        if (outOfStock) return;
        
        addToCart({
            id: productId,
            name: productName,
            price,
            image_url: imageUrl,
        }, quantity);

        const message = `Hello ${storeName || 'Store'}!\n\nI want to buy:\n*${productName}*\nQuantity: ${quantity}\nPrice: ₦${(price * quantity).toLocaleString()}\n\nView item: https://${subdomain || 'shop'}.solosme.ng/product/${productId}`;
        
        let num = whatsappNumber || '2348000000000';
        num = num.replace(/\D/g, ''); 
        if (num.startsWith('0') && num.length === 11) {
            num = '234' + num.slice(1);
        } else if (!num.startsWith('234') && num.length === 10) {
            num = '234' + num;
        }

        const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleGroupBuy = () => {
        if (outOfStock) return;
        const code = 'GB-' + Math.floor(1000 + Math.random() * 9000);
        setGroupBuyCode(code);
        setShowGroupModal(true);
    };

    const handleShareGroupBuy = () => {
        const link = `https://${subdomain || 'shop'}.solosme.ng/product/${productId}?groupBuy=true&code=${groupBuyCode}`;
        const message = `👥 Hey! Join my Group Buy on SOLO to get 15% off on *${productName}*! We just need a few more people to unlock the discount. Join here: ${link}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleCopyGroupBuy = () => {
        const link = `https://${subdomain || 'shop'}.solosme.ng/product/${productId}?groupBuy=true&code=${groupBuyCode}`;
        navigator.clipboard.writeText(link);
        toast.success("Group Buy link copied to clipboard!");
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

                {!outOfStock && (
                    <button
                        type="button"
                        onClick={handleWhatsAppOrder}
                        className="btn btn-secondary btn-lg"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            backgroundColor: '#25D366',
                            color: '#fff',
                            border: 'none'
                        }}
                    >
                        <MessageCircle size={20} />
                        Order via WhatsApp
                    </button>
                )}

                {!outOfStock && (
                    <button
                        type="button"
                        onClick={handleGroupBuy}
                        className="btn btn-secondary btn-lg"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            backgroundColor: '#E1306C',
                            color: '#fff',
                            border: 'none'
                        }}
                    >
                        <Users size={20} />
                        👥 Start a Group Buy (15% Off)
                    </button>
                )}
            </div>

            {showGroupModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000, padding: '1rem', backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        background: 'var(--surface)', borderRadius: '24px', padding: '2rem',
                        maxWidth: '420px', width: '100%', textAlign: 'center',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -10px rgba(0,0,0,0.04)',
                        border: '1.5px solid var(--border)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--ink)', marginBottom: '0.5rem' }}>
                            Group Buy Active!
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--ink)', opacity: 0.7, marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            Invite 3 friends to buy *{productName}* together to unlock a **15% discount** for everyone!
                        </p>

                        {/* Progress Tracker */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '2rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E1306C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>1</div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border)', color: 'var(--ink)', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>2</div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border)', color: 'var(--ink)', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>3</div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border)', color: 'var(--ink)', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>4</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button
                                onClick={handleShareGroupBuy}
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', backgroundColor: '#25D366', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <MessageCircle size={18} />
                                Share Invite to WhatsApp
                            </button>
                            <button
                                onClick={handleCopyGroupBuy}
                                className="btn btn-secondary btn-lg"
                                style={{ width: '100%', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--ink)' }}
                            >
                                Copy Invite Link
                            </button>
                            <button
                                onClick={() => {
                                    // Add product to cart and redirect to checkout with discount
                                    addToCart({
                                        id: productId,
                                        name: productName,
                                        price,
                                        image_url: imageUrl,
                                    }, quantity);
                                    if (subdomain) {
                                        router.push(`/store/${subdomain}/checkout?discount=group`);
                                    }
                                }}
                                className="btn btn-secondary btn-lg"
                                style={{ width: '100%', border: 'none', background: '#E1306C', color: '#fff', fontWeight: 800 }}
                            >
                                Checkout with Group Price
                            </button>
                            <button
                                onClick={() => setShowGroupModal(false)}
                                style={{
                                    border: 'none', background: 'transparent', color: 'var(--ink)', opacity: 0.5,
                                    fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem'
                                }}
                            >
                                Close & Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


