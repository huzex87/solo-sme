'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import styles from '../store.module.css';
import { LogisticsService, DeliveryQuote } from '@/services/logisticsService';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [address, setAddress] = useState('');
    const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);

    // Recalculate delivery fee when address or method changes
    useEffect(() => {
        if (deliveryMethod === 'delivery' && address.length > 5) {
            const timer = setTimeout(async () => {
                const quote = await LogisticsService.getDeliveryQuote('Store Location', address);
                setDeliveryQuote(quote);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setDeliveryQuote(null);
        }
    }, [address, deliveryMethod]);

    const finalTotal = totalPrice + (deliveryQuote?.fee || 0);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate order API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        clearCart();
        setSubmitted(true);
        setLoading(false);
    };

    if (submitted) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <span style={{ fontSize: '4rem' }}>✅</span>
                <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginTop: '1rem' }}>Order Placed!</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: 'var(--font-size-lg)' }}>
                    Thank you for your purchase. You&apos;ll receive a confirmation email shortly.
                </p>
                <div style={{ marginTop: '2rem' }}>
                    <button className="btn btn-primary" onClick={() => window.location.href = window.location.pathname.replace('/checkout', '/delivery')}>
                        Track Delivery
                    </button>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                <h3>No items to checkout</h3>
            </div>
        );
    }

    return (
        <div className={styles.checkoutPage}>
            <h1 className={styles.checkoutTitle}>Checkout</h1>

            <form className={styles.checkoutForm} onSubmit={handleSubmit}>
                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Delivery Method</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            className={`btn ${deliveryMethod === 'delivery' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setDeliveryMethod('delivery')}
                            style={{ flex: 1 }}
                        >
                            🚚 Delivery
                        </button>
                        <button
                            type="button"
                            className={`btn ${deliveryMethod === 'pickup' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setDeliveryMethod('pickup')}
                            style={{ flex: 1 }}
                        >
                            🏪 Pickup
                        </button>
                    </div>

                    {deliveryMethod === 'delivery' ? (
                        <>
                            <div className="input-group">
                                <label className="input-label">Street Address</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="123 Main Street, Lagos"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                            {deliveryQuote && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0, 229, 255, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                                        📍 Approx. {deliveryQuote.distanceKm}km away. Arrival in {deliveryQuote.durationMinutes} mins.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                Pick up your order at: <br />
                                <strong>SOLO HQ, Ikeja, Lagos</strong>
                            </p>
                        </div>
                    )}
                </div>

                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Contact Information</h3>
                    <div className={styles.checkoutRow}>
                        <div className="input-group">
                            <label className="input-label">First Name</label>
                            <input type="text" className="input-field" placeholder="John" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Last Name</label>
                            <input type="text" className="input-field" placeholder="Doe" required />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Order Summary</h3>
                    {items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{item.name} × {item.quantity}</span>
                            <span style={{ fontWeight: 600 }}>₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                        <span>Subtotal</span>
                        <span>₦{totalPrice.toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-tertiary)' }}>
                        <span>Delivery Fee</span>
                        <span>{deliveryMethod === 'pickup' ? 'Free' : `₦${(deliveryQuote?.fee || 0).toLocaleString()}`}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem', fontWeight: 800, fontSize: 'var(--font-size-xl)' }}>
                        <span>Total</span>
                        <span>₦{finalTotal.toLocaleString()}</span>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Processing Order...' : `Place Order — ₦${finalTotal.toLocaleString()}`}
                </button>
            </form>
        </div>
    );
}
