'use client';

import { useState, FormEvent } from 'react';
import { useCart } from '@/context/CartContext';
import styles from '../store.module.css';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
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
                    <div className="input-group" style={{ marginTop: 'var(--space-lg)' }}>
                        <label className="input-label">Email</label>
                        <input type="email" className="input-field" placeholder="john@example.com" required />
                    </div>
                    <div className="input-group" style={{ marginTop: 'var(--space-lg)' }}>
                        <label className="input-label">Phone</label>
                        <input type="tel" className="input-field" placeholder="+234 800 000 0000" required />
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-xl)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-lg)' }}>Delivery Address</h3>
                    <div className="input-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="input-label">Street Address</label>
                        <input type="text" className="input-field" placeholder="123 Main Street" required />
                    </div>
                    <div className={styles.checkoutRow}>
                        <div className="input-group">
                            <label className="input-label">City</label>
                            <input type="text" className="input-field" placeholder="Lagos" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">State</label>
                            <input type="text" className="input-field" placeholder="Lagos State" required />
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', marginTop: '1rem', fontWeight: 800, fontSize: 'var(--font-size-xl)' }}>
                        <span>Total</span>
                        <span>₦{totalPrice.toLocaleString()}</span>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Processing Order...' : `Place Order — ₦${totalPrice.toLocaleString()}`}
                </button>
            </form>
        </div>
    );
}
