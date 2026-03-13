'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from '../store.module.css';
import Link from 'next/link';
import { LogisticsService, DeliveryQuote, Location } from '@/services/logisticsService';
import { OrderService } from '@/services/orderService';
import { TenantService, Tenant } from '@/services/tenantService';
import { TaxService } from '@/services/taxService';
import { CurrencyService } from '@/services/currencyService';
import { MapPin, Truck, Store, CreditCard, Loader2, CheckCircle, MessageCircle } from 'lucide-react';
import { WhatsAppUtils } from '@/lib/whatsapp';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart, currency } = useCart();
    const params = useParams();
    const router = useRouter();
    const subdomain = params.subdomain as string;

    const [currentStep, setCurrentStep] = useState(1); // 1: Contact, 2: Fulfillment, 3: Review
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
    const [address, setAddress] = useState('');
    const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
    const [calculating, setCalculating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [storeLocations, setStoreLocations] = useState<Location[]>([]);
    const [selectedStore, setSelectedStore] = useState<Location | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    useEffect(() => {
        async function initCheckout() {
            const tenantData = await TenantService.getTenantBySubdomain(subdomain);
            if (tenantData) {
                setTenant(tenantData);
                const locations = await LogisticsService.getStoreLocations(tenantData.id);
                setStoreLocations(locations);
                setSelectedStore(locations[0]);
            }
        }
        initCheckout();
    }, [subdomain]);

    // Calculate delivery fee when address changes
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (deliveryType === 'delivery' && address.length > 5) {
                setCalculating(true);
                try {
                    // Origin would typically be the store address
                    const origin = storeLocations[0]?.address || 'Lagos, Nigeria';
                    const quote = await LogisticsService.getDeliveryQuote(origin, address, tenant?.id);
                    setDeliveryQuote(quote);
                } catch (err) {
                    console.error('Calculation failed', err);
                } finally {
                    setCalculating(false);
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [address, deliveryType, storeLocations]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleWhatsAppCheckout = async () => {
        if (!tenant) return;
        setIsSubmitting(true);
        try {
            const subtotal = totalPrice;
            const deliveryFee = deliveryType === 'delivery' ? (deliveryQuote?.fee || 0) : 0;
            const { tax, total } = TaxService.calculateTotal(subtotal, deliveryFee, tenant.currency);

            // 1. Create Order in DB
            const orderData = {
                tenant_id: tenant.id,
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone,
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                tax_amount: tax,
                total_amount: total,
                channel: 'whatsapp' as const,
                delivery_method: deliveryType,
                delivery_address: deliveryType === 'delivery' ? address : selectedStore?.address,
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                status: 'pending' as const
            };

            const result = await OrderService.createOrder(orderData);

            if (result) {
                // 2. Clear Cart locally
                clearCart();
                setOrderSuccess(true); // Show local success but redirected to WA

                // 3. Generate WhatsApp Link
                const waLink = WhatsAppUtils.generateOrderLink(
                    tenant.phone || tenant.business_config?.phone || '',
                    tenant.name,
                    {
                        orderId: result.id,
                        customerName: formData.name,
                        customerPhone: formData.phone,
                        items: items.map(i => ({ name: i.name, quantity: i.quantity })),
                        totalAmount: total,
                        currency: tenant.currency || 'NGN',
                        deliveryType: deliveryType,
                        address: address
                    }
                );

                window.open(waLink, '_blank');
            }
        } catch (err) {
            console.error('WhatsApp checkout failed', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setIsSubmitting(true);
        try {
            const subtotal = totalPrice;
            const deliveryFee = deliveryType === 'delivery' ? (deliveryQuote?.fee || 0) : 0;
            const { tax, total, rule } = TaxService.calculateTotal(subtotal, deliveryFee, tenant.currency);

            const orderData = {
                tenant_id: tenant.id,
                customer_name: formData.name,
                customer_email: formData.email,
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                tax_amount: tax,
                tax_rate: rule.rate,
                total_amount: total,
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                status: 'pending' as const
            };

            const result = await OrderService.createOrder(orderData);
            if (result && result.id) {
                // Initialize Payment with Paystack
                if (total > 0) {
                    try {
                        const payRes = await fetch('/api/payments/initialize', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                amount: total,
                                email: formData.email,
                                reference: `SOLO-${Date.now()}-${result.id.slice(0, 8)}`,
                                provider: 'paystack',
                                callback_url: `${window.location.origin}${window.location.pathname}/success`,
                                metadata: {
                                    orderId: result.id,
                                    tenantId: tenant.id
                                }
                            })
                        });

                        if (payRes.ok) {
                            const payData = await payRes.json();
                            if (payData.authorization_url) {
                                // Redirect to Paystack
                                window.location.href = payData.authorization_url;
                                return;
                            }
                        }
                    } catch (payErr) {
                        console.error('Failed to initialize Paystack checkout:', payErr);
                    }
                }

                setOrderSuccess(true);
                clearCart();
            }
        } catch (err) {
            console.error('Order submission failed', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className={styles.emptyCart} style={{ minHeight: '60vh' }}>
                <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: 'var(--color-success)', marginBottom: '1.5rem' }}>
                        <CheckCircle size={80} />
                    </div>
                    <h1 className="gradient-text">Order Confirmed!</h1>
                    <p style={{ maxWidth: '400px', margin: '1rem auto' }}>
                        Your specialized order for <strong>{tenant?.name}</strong> has been received.
                        A confirmation signal has been sent to your email.
                    </p>
                    <button
                        onClick={() => router.push(`/store/${subdomain}`)}
                        className="btn btn-primary"
                        style={{ marginTop: '2rem' }}
                    >
                        Back to Storefront
                    </button>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className={styles.emptyCart} style={{ minHeight: '60vh' }}>
                <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
                        <Loader2 size={80} className="animate-spin" />
                    </div>
                    <h3>Refreshing Cart...</h3>
                    <p>Redirecting to cart to secure your selections.</p>
                </div>
            </div>
        );
    }

    const deliveryFee = deliveryType === 'delivery' ? (deliveryQuote?.fee || 0) : 0;
    const { tax, total: finalTotal, rule } = TaxService.calculateTotal(totalPrice, deliveryFee, tenant?.currency || 'NGN');

    return (
        <div className={styles.checkoutPage}>
            <div className={styles.progressHeader}>
                {[
                    { step: 1, label: 'Contact' },
                    { step: 2, label: 'Fulfillment' },
                    { step: 3, label: 'Review' }
                ].map((s) => (
                    <div key={s.step} className={`${styles.stepIndicator} ${currentStep >= s.step ? styles.stepActive : ''}`}>
                        <div className={styles.stepCircle}>{currentStep > s.step ? '✓' : s.step}</div>
                        <span>{s.label}</span>
                        {s.step < 3 && <div className={styles.stepLine} />}
                    </div>
                ))}
            </div>

            <div className={styles.checkoutGrid}>
                <div className={styles.checkoutForm}>
                    {currentStep === 1 && (
                        <div className="card animate-entrance">
                            <h3 className={styles.cardTitle}>Contact Details</h3>
                            <div className={styles.inputGroup}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Your full name"
                                    required
                                />
                            </div>
                            <div className={styles.inputRow}>
                                <div className={styles.inputGroup}>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+234..."
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={nextStep}
                                disabled={!formData.name || !formData.email || !formData.phone}
                                style={{ marginTop: '1.5rem', width: '100%' }}
                            >
                                Continue to Fulfillment
                            </button>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="card animate-entrance">
                            <h3 className={styles.cardTitle}>Delivery & Pickup</h3>
                            <div className={styles.deliveryToggle}>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${deliveryType === 'delivery' ? styles.active : ''}`}
                                    onClick={() => setDeliveryType('delivery')}
                                >
                                    <Truck size={18} />
                                    <span>Delivery</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${deliveryType === 'pickup' ? styles.active : ''}`}
                                    onClick={() => setDeliveryType('pickup')}
                                >
                                    <Store size={18} />
                                    <span>Pickup</span>
                                </button>
                            </div>

                            {deliveryType === 'delivery' ? (
                                <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                                    <label>Delivery Address</label>
                                    <div className={styles.addressInputWrapper}>
                                        <MapPin size={18} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Enter your street address in Lagos"
                                            required
                                        />
                                        {calculating && <Loader2 size={18} className="animate-spin" style={{ position: 'absolute', right: '1rem' }} />}
                                    </div>
                                    {deliveryQuote && (
                                        <div className={styles.deliveryInfo}>
                                            <span>Distance: {deliveryQuote.distanceKm}km</span>
                                            <span>Est. Time: {deliveryQuote.durationMinutes} mins</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.pickupLocations} style={{ marginTop: '1.5rem' }}>
                                    <label>Select Pickup Point</label>
                                    {storeLocations.map((loc, idx) => (
                                        <div
                                            key={idx}
                                            className={`${styles.locationCard} ${selectedStore === loc ? styles.activeLocation : ''}`}
                                            onClick={() => setSelectedStore(loc)}
                                        >
                                            <Store size={18} />
                                            <div>
                                                <p className={styles.locAddress}>{loc.address}</p>
                                                <p className={styles.locSub}>Free Pickup</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn btn-ghost" onClick={prevStep} style={{ flex: 1 }}>Back</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={nextStep}
                                    disabled={deliveryType === 'delivery' && !deliveryQuote}
                                    style={{ flex: 2 }}
                                >
                                    Review Order
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="card animate-entrance">
                            <h3 className={styles.cardTitle}>Final Review</h3>
                            <div className={styles.reviewSection}>
                                <div className={styles.reviewItem}>
                                    <span className={styles.label}>Delivering to:</span>
                                    <p className={styles.value}>{deliveryType === 'delivery' ? address : selectedStore?.address}</p>
                                </div>
                                <div className={styles.reviewItem}>
                                    <span className={styles.label}>Contact:</span>
                                    <p className={styles.value}>{formData.name} ({formData.phone})</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                                <div className={styles.termsAgreement} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        style={{ marginTop: '0.25rem' }}
                                        required
                                    />
                                    <label htmlFor="terms" style={{ fontSize: '13px', lineHeight: 1.4, opacity: 0.8 }}>
                                        I agree to the <Link href="/terms" target="_blank" className="link">Terms of Service</Link> and
                                        understand the <Link href="/privacy" target="_blank" className="link">Refund Policy</Link> for <strong>{tenant?.name}</strong>.
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <button type="button" className="btn btn-ghost" onClick={prevStep} style={{ flex: 1 }}>Back</button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !agreedToTerms}
                                        className="btn btn-primary"
                                        style={{
                                            flex: 2,
                                            backgroundColor: tenant?.branding_config?.primaryColor || '#7c4dff',
                                            opacity: agreedToTerms ? 1 : 0.6
                                        }}
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                                        Pay Online • {CurrencyService.format(
                                            CurrencyService.convert(finalTotal, 'NGN', currency),
                                            currency
                                        )}
                                    </button>
                                </div>

                                <div className="whatsapp-checkout-container" style={{ position: 'relative' }}>
                                    <div className="divider-text" style={{ textAlign: 'center', margin: '1rem 0', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-tertiary)', position: 'relative' }}>
                                        <span style={{ background: 'var(--bg-card)', padding: '0 1rem', position: 'relative', zIndex: 1 }}>OR USE WHATSAPP</span>
                                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border-subtle)' }}></div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleWhatsAppCheckout}
                                        disabled={isSubmitting || !agreedToTerms}
                                        className="btn"
                                        style={{
                                            width: '100%',
                                            padding: '1.25rem',
                                            borderRadius: '16px',
                                            backgroundColor: '#25D366',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            border: 'none',
                                            boxShadow: '0 8px 20px rgba(37, 211, 102, 0.2)',
                                            opacity: agreedToTerms ? 1 : 0.6,
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <MessageCircle size={22} fill="currentColor" />
                                        <span>Checkout on WhatsApp</span>
                                    </button>

                                    <p style={{ fontSize: '11px', textAlign: 'center', opacity: 0.6, marginTop: '1rem', fontStyle: 'italic' }}>
                                        Our AI Assistant will handle your delivery & payment on WhatsApp.
                                    </p>
                                </div>
                                <p style={{ fontSize: '11px', textAlign: 'center', opacity: 0.5 }}>
                                    Secure checkout powered by Paystack. Your financial data is never stored on our servers.
                                </p>
                            </form>
                        </div>
                    )}
                </div>

                <div className={styles.orderSummary}>
                    <div className="card">
                        <h3 className={styles.cardTitle}>Order Summary</h3>
                        <div className={styles.summaryItems}>
                            {items.map(item => (
                                <div key={item.id} className={styles.summaryItem}>
                                    <div className={styles.sumInfo}>
                                        <span className={styles.sumName}>{item.name}</span>
                                        <span className={styles.sumQty}>Qty: {item.quantity}</span>
                                    </div>
                                    <span className={styles.sumPrice}>
                                        {CurrencyService.format(
                                            CurrencyService.convert(item.price * item.quantity, 'NGN', currency),
                                            currency
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>
                                {CurrencyService.format(
                                    CurrencyService.convert(totalPrice, 'NGN', currency),
                                    currency
                                )}
                            </span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Fulfillment</span>
                            <span>
                                {deliveryFee > 0 ?
                                    CurrencyService.format(
                                        CurrencyService.convert(deliveryFee, 'NGN', currency),
                                        currency
                                    ) : 'FREE'}
                            </span>
                        </div>
                        {tax > 0 && (
                            <div className={styles.summaryRow}>
                                <span>{rule.name} ({rule.rate * 100}%)</span>
                                <span>
                                    {CurrencyService.format(
                                        CurrencyService.convert(tax, 'NGN', currency),
                                        currency
                                    )}
                                </span>
                            </div>
                        )}
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>
                                {CurrencyService.format(
                                    CurrencyService.convert(finalTotal, 'NGN', currency),
                                    currency
                                )}
                            </span>
                        </div>

                        <div className={styles.safeShield}>
                            <CreditCard size={14} />
                            <span>Encrypted Secure Transaction</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
