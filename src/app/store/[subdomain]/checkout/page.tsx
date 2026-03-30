'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from '../store.module.css';
import Link from 'next/link';
import { LogisticsService, Location } from '@/services/logisticsService';
import { OrderService } from '@/services/orderService';
import { TenantService, Tenant } from '@/services/tenantService';
import { TaxService } from '@/services/taxService';
import { CurrencyService } from '@/services/currencyService';
import { MapPin, Truck, Store, CreditCard, Loader2, CheckCircle, MessageCircle, Building2, Banknote, Copy, Check, ExternalLink } from 'lucide-react';
import { WhatsAppUtils } from '@/lib/whatsapp';
import { getBaseUrl } from '@/lib/baseUrl';
import { ExpressCheckout, saveExpressCustomer } from '@/components/storefront/ExpressCheckout';
import { saveReorderHistory } from '@/components/storefront/SmartReorder';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart, currency } = useCart();
    const params = useParams();
    const router = useRouter();
    const subdomain = params.subdomain as string;

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
    const [address, setAddress] = useState('');
    const [calculating, setCalculating] = useState(false);
    const [deliveryFeeCalc, setDeliveryFeeCalc] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [waLink, setWaLink] = useState('');
    const [storeLocations, setStoreLocations] = useState<Location[]>([]);
    const [selectedStore, setSelectedStore] = useState<Location | null>(null);
    const [taxData, setTaxData] = useState<{ tax: number; total: number; rule: { name: string; rate: number } } | null>(null);
    const [bankTransferOrderId, setBankTransferOrderId] = useState<string | null>(null);
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'pay_on_delivery' | 'online' | 'whatsapp'>('bank_transfer');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        async function init() {
            const tenantData = await TenantService.getTenantBySubdomain(subdomain);
            if (tenantData) {
                setTenant(tenantData);
                const locations = await LogisticsService.getStoreLocations(tenantData.id);
                setStoreLocations(locations);
                setSelectedStore(locations[0] ?? null);

                // Default to whatsapp if it's the only/preferred method
                const methods = tenantData.business_config?.payment_methods ?? [];
                if (methods.length > 0 && !methods.includes('bank_transfer')) {
                    setPaymentMethod(methods[0] as typeof paymentMethod);
                }
            }
        }
        init();
    }, [subdomain]);

    // Debounced delivery fee calculation — does NOT block form submission
    useEffect(() => {
        if (deliveryType !== 'delivery' || address.length < 6 || !tenant) {
            if (deliveryType !== 'delivery') setDeliveryFeeCalc(0);
            return;
        }
        const timer = setTimeout(async () => {
            setCalculating(true);
            try {
                const origin = storeLocations[0]?.address || 'Lagos, Nigeria';
                const quote = await LogisticsService.getDeliveryQuote(origin, address, tenant.id);
                setDeliveryFeeCalc(quote?.fee ?? 0);
            } catch {
                // silently fail — user can still submit, fee shown as TBD
            } finally {
                setCalculating(false);
            }
        }, 900);
        return () => clearTimeout(timer);
    }, [address, deliveryType, storeLocations, tenant]);

    // Update tax whenever totals change
    useEffect(() => {
        if (!tenant) return;
        TaxService.calculateTotal(totalPrice, deliveryFeeCalc, tenant.id, tenant.currency)
            .then(setTaxData)
            .catch(() => {});
    }, [totalPrice, deliveryFeeCalc, tenant]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!formData.name.trim()) errs.name = 'Name is required';
        if (!formData.phone.trim()) errs.phone = 'Phone number is required';
        if (deliveryType === 'delivery' && !address.trim()) errs.address = 'Delivery address is required';
        return errs;
    };

    const finalTotal = taxData?.total ?? (totalPrice + deliveryFeeCalc);
    const tax = taxData?.tax ?? 0;
    const rule = taxData?.rule ?? { name: 'Tax', rate: 0 };

    const buildOrderData = () => ({
        tenant_id: tenant!.id,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        subtotal: totalPrice,
        delivery_fee: deliveryFeeCalc,
        tax_amount: tax,
        total_amount: finalTotal,
        channel: (paymentMethod === 'whatsapp' ? 'whatsapp' : 'online') as 'whatsapp' | 'online',
        payment_method: paymentMethod,
        delivery_method: deliveryType,
        delivery_address: deliveryType === 'delivery' ? address : selectedStore?.address,
        status: 'pending' as const,
        items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        })),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        if (!agreedToTerms) return;

        setIsSubmitting(true);
        try {
            const result = await OrderService.createOrder(buildOrderData());
            if (!result?.id) throw new Error('Order creation failed');

            // Persist express checkout info for next visit
            saveExpressCustomer(subdomain, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: deliveryType === 'delivery' ? address : undefined,
            });
            saveReorderHistory(subdomain, items.map(i => ({
                id: i.id, name: i.name, price: i.price, quantity: i.quantity,
                image_url: (i as any).image_url,
            })));

            clearCart();

            if (paymentMethod === 'bank_transfer') {
                setBankTransferOrderId(result.id);
                return;
            }

            if (paymentMethod === 'whatsapp') {
                const link = WhatsAppUtils.generateOrderLink(
                    tenant.phone || tenant.business_config?.phone || '',
                    tenant.name,
                    {
                        orderId: result.id,
                        customerName: formData.name,
                        customerPhone: formData.phone,
                        items: items.map(i => ({ name: i.name, quantity: i.quantity })),
                        totalAmount: finalTotal,
                        currency: tenant.currency || 'NGN',
                        deliveryType,
                        address,
                    }
                );
                setWaLink(link);
                setOrderSuccess(true);
                return;
            }

            if (paymentMethod === 'pay_on_delivery') {
                setOrderSuccess(true);
                return;
            }

            // Online payment
            if (finalTotal > 0) {
                const provider = tenant.business_config?.preferred_payment_gateway || 'paystack';
                const payRes = await fetch(`${getBaseUrl()}/api/payments/initialize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: finalTotal,
                        email: formData.email,
                        reference: `SOLO-${Date.now()}-${result.id.slice(0, 8)}`,
                        provider,
                        callback_url: `${getBaseUrl()}${window.location.pathname}/success`,
                        metadata: { orderId: result.id, tenantId: tenant.id, phone: formData.phone, name: formData.name }
                    })
                });
                if (payRes.ok) {
                    const { authorization_url } = await payRes.json();
                    if (authorization_url) { window.location.href = authorization_url; return; }
                }
            }
            setOrderSuccess(true);
        } catch (err) {
            console.error('Checkout failed', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Bank transfer screen ─────────────────────────────────────────
    if (bankTransferOrderId && tenant) {
        const bankName = tenant.business_config?.bank_name || '';
        const accountNumber = tenant.business_config?.bank_account_number || '';
        const accountName = tenant.business_config?.bank_account_name || '';

        return (
            <div className={styles.emptyCart} style={{ minHeight: '60vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 480, margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ color: 'var(--color-primary, #00798C)', marginBottom: '1rem' }}>
                        <Building2 size={64} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Transfer Payment</h2>
                    <p style={{ fontSize: 14, opacity: 0.7, textAlign: 'center', marginBottom: '1.5rem' }}>
                        Transfer <strong>{CurrencyService.format(CurrencyService.convert(finalTotal, 'NGN', currency), currency)}</strong> to complete your order.
                    </p>

                    <div style={{ width: '100%', background: '#fff', border: '2px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>Bank</p>
                                <p style={{ fontSize: 16, fontWeight: 700 }}>{bankName}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>Account Number</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em' }}>{accountNumber}</p>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(accountNumber); setCopiedAccount(true); setTimeout(() => setCopiedAccount(false), 2000); }}
                                        style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                    >
                                        {copiedAccount ? <Check size={14} /> : <Copy size={14} />}
                                        {copiedAccount ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>Account Name</p>
                                <p style={{ fontSize: 16, fontWeight: 700 }}>{accountName}</p>
                            </div>
                            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1rem' }}>
                                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>Amount</p>
                                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary, #00798C)' }}>
                                    {CurrencyService.format(CurrencyService.convert(finalTotal, 'NGN', currency), currency)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: '100%', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', fontSize: 13, lineHeight: 1.5 }}>
                        <p><strong>Order ID:</strong> {bankTransferOrderId.slice(0, 8).toUpperCase()}</p>
                        <p style={{ marginTop: '0.5rem' }}>After transferring, the seller will confirm your payment and process your order.</p>
                    </div>

                    <button onClick={() => router.push(`/store/${subdomain}`)} className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
                        Done — Back to Store
                    </button>
                </div>
            </div>
        );
    }

    // ── Order success screen ─────────────────────────────────────────
    if (orderSuccess) {
        const isWhatsApp = paymentMethod === 'whatsapp' && !!waLink;
        return (
            <div className={styles.emptyCart} style={{ minHeight: '60vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 420, margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--color-success)', marginBottom: '1.5rem' }}>
                        <CheckCircle size={72} />
                    </div>
                    <h1 className="gradient-text" style={{ marginBottom: '0.5rem' }}>Order Confirmed!</h1>
                    <p style={{ fontSize: 14, opacity: 0.75, marginBottom: '1.5rem', lineHeight: 1.6 }}>
                        Your order for <strong>{tenant?.name}</strong> has been received.{' '}
                        {paymentMethod === 'pay_on_delivery' && 'Have the exact amount ready when your order arrives.'}
                        {isWhatsApp && 'Tap the button below to complete your order via WhatsApp.'}
                    </p>

                    {isWhatsApp && (
                        <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn"
                            style={{
                                width: '100%', padding: '0.9rem', marginBottom: '0.75rem',
                                backgroundColor: '#25D366', color: '#fff', fontWeight: 700,
                                borderRadius: 14, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '0.5rem', fontSize: 15,
                                textDecoration: 'none', border: 'none'
                            }}
                        >
                            <MessageCircle size={20} />
                            Open WhatsApp to Complete Order
                            <ExternalLink size={14} style={{ opacity: 0.7 }} />
                        </a>
                    )}

                    <button onClick={() => router.push(`/store/${subdomain}`)} className="btn btn-ghost" style={{ width: '100%', marginTop: '0.25rem' }}>
                        Back to Storefront
                    </button>
                </div>
            </div>
        );
    }

    // ── Empty cart guard ─────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className={styles.emptyCart} style={{ minHeight: '60vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
                    <h3>Refreshing Cart…</h3>
                    <p>Redirecting you back to your selections.</p>
                </div>
            </div>
        );
    }

    const tenantPaymentMethods = tenant?.business_config?.payment_methods ?? ['bank_transfer', 'pay_on_delivery', 'whatsapp'];
    const hasPhone = !!(tenant?.phone || tenant?.business_config?.phone);

    // ── Main checkout (single step) ──────────────────────────────────
    return (
        <div className={styles.checkoutPage}>
            <div className={styles.checkoutGrid}>
                {/* ── Left: form ── */}
                <form onSubmit={handleSubmit} className={styles.checkoutForm} noValidate>

                    {/* Express Checkout for returning customers */}
                    <ExpressCheckout
                        subdomain={subdomain}
                        onApply={(customer) => {
                            setFormData({ name: customer.name, email: customer.email, phone: customer.phone });
                            if (customer.address) setAddress(customer.address);
                        }}
                    />

                    {/* ── Contact ── */}
                    <div className="card">
                        <h3 className={styles.cardTitle}>Contact Details</h3>
                        <div className={styles.inputGroup}>
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Your full name"
                                autoComplete="name"
                            />
                            {errors.name && <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.name}</span>}
                        </div>
                        <div className={styles.inputRow} style={{ marginTop: '1rem' }}>
                            <div className={styles.inputGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="email@example.com"
                                    autoComplete="email"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Phone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+234…"
                                    autoComplete="tel"
                                />
                                {errors.phone && <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.phone}</span>}
                            </div>
                        </div>
                    </div>

                    {/* ── Delivery / Pickup ── */}
                    <div className="card" style={{ marginTop: '1rem' }}>
                        <h3 className={styles.cardTitle}>Delivery & Pickup</h3>
                        <div className={styles.deliveryToggle}>
                            <button type="button" className={`${styles.toggleBtn} ${deliveryType === 'delivery' ? styles.active : ''}`} onClick={() => setDeliveryType('delivery')}>
                                <Truck size={18} /><span>Delivery</span>
                            </button>
                            <button type="button" className={`${styles.toggleBtn} ${deliveryType === 'pickup' ? styles.active : ''}`} onClick={() => setDeliveryType('pickup')}>
                                <Store size={18} /><span>Pickup</span>
                            </button>
                        </div>

                        {deliveryType === 'delivery' ? (
                            <div className={styles.inputGroup} style={{ marginTop: '1.25rem' }}>
                                <label>Delivery Address *</label>
                                <div className={styles.addressInputWrapper}>
                                    <MapPin size={18} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors(p => ({ ...p, address: '' })); }}
                                        placeholder="Enter your street address"
                                        autoComplete="street-address"
                                    />
                                    {calculating && <Loader2 size={16} className="animate-spin" style={{ position: 'absolute', right: '1rem', color: 'var(--color-primary)' }} />}
                                </div>
                                {errors.address && <span style={{ color: '#ef4444', fontSize: 12 }}>{errors.address}</span>}
                                {deliveryFeeCalc > 0 && (
                                    <div className={styles.deliveryInfo}>
                                        <span>Delivery fee:</span>
                                        <span style={{ fontWeight: 700 }}>{CurrencyService.format(CurrencyService.convert(deliveryFeeCalc, 'NGN', currency), currency)}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.pickupLocations} style={{ marginTop: '1.25rem' }}>
                                <label>Select Pickup Point</label>
                                {storeLocations.map((loc, idx) => (
                                    <div key={idx} className={`${styles.locationCard} ${selectedStore === loc ? styles.activeLocation : ''}`} onClick={() => setSelectedStore(loc)}>
                                        <Store size={18} />
                                        <div>
                                            <p className={styles.locAddress}>{loc.address}</p>
                                            <p className={styles.locSub}>Free Pickup</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Payment Method ── */}
                    <div className="card" style={{ marginTop: '1rem' }}>
                        <h3 className={styles.cardTitle}>Payment Method</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>

                            {(tenantPaymentMethods.includes('bank_transfer')) && (
                                <PaymentOption
                                    icon={<Building2 size={20} />}
                                    label="Bank Transfer"
                                    desc="Transfer to seller's bank account"
                                    selected={paymentMethod === 'bank_transfer'}
                                    color="var(--color-primary, #00798C)"
                                    onClick={() => setPaymentMethod('bank_transfer')}
                                />
                            )}

                            {(tenantPaymentMethods.includes('pay_on_delivery')) && (
                                <PaymentOption
                                    icon={<Banknote size={20} />}
                                    label="Pay on Delivery"
                                    desc="Pay cash when your order arrives"
                                    selected={paymentMethod === 'pay_on_delivery'}
                                    color="var(--color-primary, #00798C)"
                                    onClick={() => setPaymentMethod('pay_on_delivery')}
                                />
                            )}

                            {hasPhone && (
                                <PaymentOption
                                    icon={<MessageCircle size={20} />}
                                    label="WhatsApp Checkout"
                                    desc="Complete your order via WhatsApp chat"
                                    selected={paymentMethod === 'whatsapp'}
                                    color="#25D366"
                                    onClick={() => setPaymentMethod('whatsapp')}
                                />
                            )}

                            {((tenantPaymentMethods as string[]).some(m => m === 'online' || m === 'card')) && finalTotal > 0 && (
                                <PaymentOption
                                    icon={<CreditCard size={20} />}
                                    label={`Pay Online — ${CurrencyService.format(CurrencyService.convert(finalTotal, 'NGN', currency), currency)}`}
                                    desc="Secure card payment via Paystack"
                                    selected={paymentMethod === 'online'}
                                    color="var(--color-primary, #00798C)"
                                    onClick={() => setPaymentMethod('online')}
                                />
                            )}
                        </div>
                    </div>

                    {/* ── Terms + Submit ── */}
                    <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: 13, lineHeight: 1.5, cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                style={{ marginTop: 3, flexShrink: 0 }}
                            />
                            <span style={{ opacity: 0.75 }}>
                                I agree to the{' '}
                                <Link href="/terms" target="_blank" className="link">Terms of Service</Link>{' '}
                                and <Link href="/privacy" target="_blank" className="link">Refund Policy</Link>{' '}
                                for <strong>{tenant?.name}</strong>.
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={isSubmitting || !agreedToTerms}
                            className="btn"
                            style={{
                                width: '100%',
                                padding: '0.9rem',
                                borderRadius: 14,
                                fontWeight: 700,
                                fontSize: 15,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                border: 'none',
                                cursor: agreedToTerms ? 'pointer' : 'not-allowed',
                                opacity: agreedToTerms ? 1 : 0.55,
                                backgroundColor: paymentMethod === 'whatsapp' ? '#25D366' : (tenant?.branding_config?.primaryColor || 'var(--color-primary, #00798C)'),
                                color: '#fff',
                                transition: 'all 0.2s',
                            }}
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : paymentMethod === 'whatsapp' ? (
                                <MessageCircle size={18} />
                            ) : paymentMethod === 'bank_transfer' ? (
                                <Building2 size={18} />
                            ) : paymentMethod === 'pay_on_delivery' ? (
                                <Banknote size={18} />
                            ) : (
                                <CreditCard size={18} />
                            )}
                            {isSubmitting ? 'Placing Order…' :
                                paymentMethod === 'whatsapp' ? 'Place Order & Open WhatsApp' :
                                paymentMethod === 'bank_transfer' ? 'Place Order' :
                                paymentMethod === 'pay_on_delivery' ? 'Place Order (Pay on Delivery)' :
                                `Pay ${CurrencyService.format(CurrencyService.convert(finalTotal, 'NGN', currency), currency)}`}
                        </button>

                        <div className={styles.safeShield}>
                            <CreditCard size={13} />
                            <span>Secure & Encrypted</span>
                        </div>
                    </div>
                </form>

                {/* ── Right: Order summary ── */}
                <div className={styles.orderSummary}>
                    <div className="card">
                        <h3 className={styles.cardTitle}>Order Summary</h3>
                        <div className={styles.summaryItems}>
                            {items.map(item => (
                                <div key={item.id} className={styles.summaryItem}>
                                    <div className={styles.sumInfo}>
                                        <span className={styles.sumName}>{item.name}</span>
                                        <span className={styles.sumQty}>× {item.quantity}</span>
                                    </div>
                                    <span className={styles.sumPrice}>
                                        {CurrencyService.format(CurrencyService.convert(item.price * item.quantity, 'NGN', currency), currency)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.divider} />
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>{CurrencyService.format(CurrencyService.convert(totalPrice, 'NGN', currency), currency)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Delivery</span>
                            <span>{deliveryFeeCalc > 0 ? CurrencyService.format(CurrencyService.convert(deliveryFeeCalc, 'NGN', currency), currency) : calculating ? '…' : 'FREE'}</span>
                        </div>
                        {tax > 0 && (
                            <div className={styles.summaryRow}>
                                <span>{rule.name} ({(rule.rate * 100).toFixed(0)}%)</span>
                                <span>{CurrencyService.format(CurrencyService.convert(tax, 'NGN', currency), currency)}</span>
                            </div>
                        )}
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>{CurrencyService.format(CurrencyService.convert(finalTotal, 'NGN', currency), currency)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Reusable payment method card ─────────────────────────────────────
function PaymentOption({ icon, label, desc, selected, color, onClick }: {
    icon: React.ReactNode;
    label: string;
    desc: string;
    selected: boolean;
    color: string;
    onClick: () => void;
}) {
    return (
        <div
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem',
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                border: selected ? `2px solid ${color}` : '2px solid var(--border-subtle, #e2e8f0)',
                background: selected ? `${color}10` : 'transparent',
            }}
        >
            <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: selected ? color : '#f1f5f9',
                color: selected ? '#fff' : '#94a3b8',
                transition: 'all 0.15s',
            }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{label}</p>
                <p style={{ fontSize: 12, opacity: 0.6, margin: 0 }}>{desc}</p>
            </div>
            <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${selected ? color : '#cbd5e1'}`,
                background: selected ? color : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
            }}>
                {selected && <Check size={11} color="#fff" />}
            </div>
        </div>
    );
}
