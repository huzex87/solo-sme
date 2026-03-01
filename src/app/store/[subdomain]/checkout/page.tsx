'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import styles from '../store.module.css';
import { LogisticsService, DeliveryQuote } from '@/services/logisticsService';
import { getTranslation, Locale } from '@/lib/i18n';
import { PaymentService, PaymentProvider } from '@/services/paymentService';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart, locale } = useCart();
    const t = getTranslation(locale as Locale);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('cod');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
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
            const timer = setTimeout(() => setDeliveryQuote(null), 0);
            return () => clearTimeout(timer);
        }
    }, [address, deliveryMethod]);

    const finalTotal = totalPrice + (deliveryQuote?.fee || 0);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (paymentMethod !== 'cod') {
            // Online Payment Flow
            const intent = await PaymentService.createPaymentIntent(finalTotal, email, paymentMethod);
            if (intent.checkoutUrl) {
                // In a real app, you'd save the order as 'pending_payment' here
                window.location.href = intent.checkoutUrl;
                return;
            }
        }

        // Cash on Delivery Flow
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
            <h1 className={styles.checkoutTitle}>{t.checkout}</h1>

            <form className={styles.checkoutForm} onSubmit={handleSubmit}>
                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>{t.delivery} Method</h3>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            className={`btn ${deliveryMethod === 'delivery' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setDeliveryMethod('delivery')}
                            style={{ flex: 1 }}
                        >
                            🚚 {t.delivery}
                        </button>
                        <button
                            type="button"
                            className={`btn ${deliveryMethod === 'pickup' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setDeliveryMethod('pickup')}
                            style={{ flex: 1 }}
                        >
                            🏪 {t.pickup}
                        </button>
                    </div>

                    {deliveryMethod === 'delivery' ? (
                        <>
                            <div className="input-group">
                                <label className="input-label">{t.delivery_address}</label>
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
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Payment Method</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                        <button
                            type="button"
                            className={`btn ${paymentMethod === 'cod' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setPaymentMethod('cod')}
                        >
                            💵 Cash on Delivery
                        </button>
                        <button
                            type="button"
                            className={`btn ${paymentMethod === 'paystack' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setPaymentMethod('paystack')}
                        >
                            💳 Pay with Paystack
                        </button>
                        <button
                            type="button"
                            className={`btn ${paymentMethod === 'stripe' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setPaymentMethod('stripe')}
                        >
                            🌍 International (Stripe)
                        </button>
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>{t.contact_info}</h3>
                    <div className="input-group" style={{ marginBottom: '1rem' }}>
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
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
                        <span>{t.total}</span>
                        <span>₦{finalTotal.toLocaleString()}</span>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Processing Order...' : `${t.order_now} — ₦${finalTotal.toLocaleString()}`}
                </button>
            </form>
        </div>
    );
}
