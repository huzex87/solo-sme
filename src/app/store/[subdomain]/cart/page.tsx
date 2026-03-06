'use client';

import { useCart } from '@/context/CartContext';
import { getTranslation, Locale } from '@/lib/i18n';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { TenantService } from '@/services/tenantService';
import styles from '../store.module.css';

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, totalPrice, totalItems, locale } = useCart();
    const t = getTranslation(locale as Locale);
    const params = useParams();
    const subdomain = params?.subdomain as string;

    useEffect(() => {
        async function fetchTenant() {
            if (!subdomain) return;
            await TenantService.getTenantBySubdomain(subdomain);
        }
        fetchTenant();
    }, [subdomain]);

    if (items.length === 0) {
        return (
            <div className={styles.emptyCart}>
                <span style={{ fontSize: '4rem' }}>🛒</span>
                <h3>Your cart is empty</h3>
                <p>Browse our collection and add items to your cart.</p>
                <Link href={`/store/${subdomain}`} className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.cartPage}>
            <h1 className={styles.cartTitle}>{t.cart} ({totalItems})</h1>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {items.map(item => (
                    <div key={item.id} className={styles.cartItem}>
                        <div className={styles.cartItemImage}>📦</div>
                        <div className={styles.cartItemInfo}>
                            <div className={styles.cartItemName}>{item.name}</div>
                            <div className={styles.cartItemPrice}>₦{item.price.toLocaleString()}</div>
                        </div>
                        <div className={styles.cartItemActions}>
                            <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                            <span className={styles.qtyValue}>{item.quantity}</span>
                            <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                        <div style={{ fontWeight: 700, minWidth: '5rem', textAlign: 'right' }}>
                            ₦{(item.price * item.quantity).toLocaleString()}
                        </div>
                        <button onClick={() => removeFromCart(item.id)} style={{ color: 'var(--color-error)', fontSize: '1.25rem' }}>✕</button>
                    </div>
                ))}
            </div>

            <div className={`card ${styles.cartSummary}`}>
                <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>₦{totalPrice.toLocaleString()}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span>{t.delivery}</span>
                    <span style={{ color: 'var(--color-success)' }}>{t.free_delivery}</span>
                </div>
                <div className={styles.summaryTotal}>
                    <span>{t.total}</span>
                    <span>₦{totalPrice.toLocaleString()}</span>
                </div>
                <Link href={`/store/${subdomain}/checkout`} className={`btn btn-primary ${styles.checkoutBtn}`}>
                    {t.checkout}
                </Link>
            </div>
        </div>
    );
}
