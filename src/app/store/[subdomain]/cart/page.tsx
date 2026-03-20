'use client';

import { useCart } from '@/context/CartContext';
import { getTranslation, Locale } from '@/lib/i18n';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { TenantService } from '@/services/tenantService';
import { CurrencyService } from '@/services/currencyService';
import { Package, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import styles from '../store.module.css';
import { SmartReorder } from '@/components/storefront/SmartReorder';

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, totalPrice, totalItems, locale, currency } = useCart();
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
                <SmartReorder
                    subdomain={subdomain}
                    currency={currency}
                    onAddToCart={() => {}}
                />
                <ShoppingBag size={48} strokeWidth={1.5} className="opacity-20" />
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
                        <div className={styles.cartItemImage}>
                            {item.image_url ? (
                                <Image
                                    src={item.image_url}
                                    alt={item.name}
                                    fill
                                    sizes="64px"
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <Package size={24} className="opacity-20" />
                            )}
                        </div>
                        <div className={styles.cartItemInfo}>
                            <div className={styles.cartItemName}>{item.name}</div>
                            <div className={styles.cartItemPrice}>
                                {CurrencyService.format(
                                    CurrencyService.convert(item.price, 'NGN', currency),
                                    currency
                                )}
                            </div>
                        </div>
                        <div className={styles.cartQuantity}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <Plus size={14} />
                            </button>
                        </div>
                        <div style={{ fontWeight: 700, minWidth: '5rem', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            {CurrencyService.format(
                                CurrencyService.convert(item.price * item.quantity, 'NGN', currency),
                                currency
                            )}
                        </div>
                        <button
                            onClick={() => removeFromCart(item.id)}
                            style={{ color: 'var(--danger)', padding: '8px', borderRadius: '8px', border: 'none', background: 'var(--danger-light)', cursor: 'pointer' }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className={`card ${styles.cartSummary}`}>
                <div className={styles.cartSummaryRow}>
                    <span>Subtotal</span>
                    <span>
                        {CurrencyService.format(
                            CurrencyService.convert(totalPrice, 'NGN', currency),
                            currency
                        )}
                    </span>
                </div>
                <div className={styles.cartSummaryRow}>
                    <span>{t.delivery}</span>
                    <span style={{ color: 'var(--success)' }}>{t.free_delivery}</span>
                </div>
                <div className={styles.cartTotal}>
                    <span>{t.total}</span>
                    <span>
                        {CurrencyService.format(
                            CurrencyService.convert(totalPrice, 'NGN', currency),
                            currency
                        )}
                    </span>
                </div>
                <Link href={`/store/${subdomain}/checkout`} className={`btn btn-primary ${styles.checkoutBtn}`}>
                    {t.checkout}
                </Link>
            </div>
        </div>
    );
}
