'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from '../store.module.css';
import Link from 'next/link';
import { LogisticsService, DeliveryQuote, Location } from '@/services/logisticsService';
import { OrderService } from '@/services/orderService';
import { TenantService, Tenant } from '@/services/tenantService';
import { TaxService, TaxRule } from '@/services/taxService';
import { CurrencyService } from '@/services/currencyService';
import { MapPin, Truck, Store, CreditCard, Loader2, CheckCircle, MessageCircle, Building2, Banknote, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { WhatsAppUtils } from '@/lib/whatsapp';
import { getBaseUrl } from '@/lib/baseUrl';
import { ExpressCheckout, saveExpressCustomer } from '@/components/storefront/ExpressCheckout';
import { saveReorderHistory } from '@/components/storefront/SmartReorder';


export default function CheckoutPage() {
    const { items, totalPrice, clearCart, currency } = useCart();
    const params = useParams();
    const router = useRouter();
    const subdomain = params.subdomain as string;

    const [currentStep, setCurrentStep] = useState(1); // 1: Information (Contact + Fulfillment), 2: Payment
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
    const [address, setAddress] = useState('');
    const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
    const [calculating, setCalculating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [storeLocations, setStoreLocations] = useState<Location[]>([]);
    const [selectedStore, setSelectedStore] = useState<Location | null>(null);
    const [taxData, setTaxData] = useState<{ tax: number; total: number; rule: TaxRule } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'pay_on_delivery' | 'online' | 'whatsapp'>('bank_transfer');
    const [bankTransferOrderId, setBankTransferOrderId] = useState<string | null>(null);
    const [copiedAccount, setCopiedAccount] = useState(false);

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 2));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    useEffect(() => {
        async function initCheckout() {
            const tenantData = await TenantService.getTenantBySubdomain(subdomain);
            if (tenantData) {
                setTenant(tenantData);
                const locations = await LogisticsService.getStoreLocations(tenantData.id);
                setStoreLocations(locations);
                setSelectedStore(locations[0]);

                // Determine best default payment method
                const hasOnline = !!(
                    (tenantData.business_config?.paystack_public_key && tenantData.business_config?.preferred_payment_gateway === 'paystack') ||
                    (tenantData.business_config?.flutterwave_public_key && tenantData.business_config?.preferred_payment_gateway === 'flutterwave')
                );
                if (hasOnline) {
                    setPaymentMethod('online');
                } else if (tenantData.business_config?.payment_methods?.includes('bank_transfer')) {
                    setPaymentMethod('bank_transfer');
                } else if (tenantData.business_config?.payment_methods?.includes('pay_on_delivery')) {
                    setPaymentMethod('pay_on_delivery');
                } else {
                    setPaymentMethod('whatsapp');
                }
            }
        }
        initCheckout();
    }, [subdomain]);

    // Calculate delivery fee when address changes
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (deliveryType === 'delivery' && address.length > 5 && tenant) {
                setCalculating(true);
                try {
                    const origin = storeLocations[0]?.address || 'Lagos, Nigeria';
                    const quote = await LogisticsService.getDeliveryQuote(origin, address, tenant.id);
                    setDeliveryQuote(quote);
                } catch (err) {
                    console.error('Calculation failed', err);
                } finally {
                    setCalculating(false);
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [address, deliveryType, storeLocations, tenant]);

    // Calculate Tax and Total whenever price or delivery changes
    useEffect(() => {
        const updateTax = async () => {
            if (!tenant) return;
            const subtotal = totalPrice;
            const deliveryFee = deliveryType === 'delivery' ? (deliveryQuote?.fee || 0) : 0;
            const res = await TaxService.calculateTotal(subtotal, deliveryFee, tenant.id, tenant.currency);
            setTaxData(res);
        };
        updateTax();
    }, [totalPrice, deliveryQuote, deliveryType, tenant]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleWhatsAppCheckout = async () => {
        if (!tenant) return;
        setIsSubmitting(true);
        try {
            const subtotal = totalPrice;
            const deliveryFee = deliveryType === 'delivery' ? (deliveryQuote?.fee || 0) : 0;
            const { tax, total } = await TaxService.calculateTotal(subtotal, deliveryFee, tenant.id, tenant.currency);

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
                setOrderSuccess(true);

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
            const { tax, total, rule } = await TaxService.calculateTotal(subtotal, deliveryFee, tenant.id, tenant.currency);

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
                status: 'pending' as const,
                payment_method: paymentMethod,
                channel: paymentMethod === 'whatsapp' ? 'whatsapp' as const : 'online' as const
            };

            const result = await OrderService.createOrder(orderData);
            if (result && result.id) {
                // Save express checkout info for returning customers
                saveExpressCustomer(subdomain, {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: deliveryType === 'delivery' ? address : undefined,
                });

                // Save reorder history
                saveReorderHistory(subdomain, items.map(i => ({
                    id: i.id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    image_url: i.image_url,
                })));

                if (paymentMethod === 'bank_transfer') {
                    // Show bank transfer details screen
                    setBankTransferOrderId(result.id);
                    clearCart();
                    return;
                }

                if (paymentMethod === 'pay_on_delivery') {
                    // Order placed, payment on delivery
                    setOrderSuccess(true);
                    clearCart();
                    return;
                }

                // Online payment via Paystack/Flutterwave
                if (total > 0 && paymentMethod === 'online') {
                    try {
                        const provider = tenant.business_config?.preferred_payment_gateway || 'paystack';
                        const payRes = await fetch(`${getBaseUrl()}/api/payments/initialize`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                amount: total,
                                email: formData.email,
                                reference: `SOLO-${Date.now()}-${result.id.slice(0, 8)}`,
                                provider: provider,
                                callback_url: `${getBaseUrl()}${window.location.pathname}/success`,
                                metadata: {
                                    orderId: result.id,
                                    tenantId: tenant.id,
                                    phone: formData.phone,
                                    name: formData.name
                                }
                            })
                        });

                        if (payRes.ok) {
                            const payData = await payRes.json();
                            if (payData.authorization_url) {
                                window.location.href = payData.authorization_url;
                                return;
                            }
                        } else {
                            const errData = await payRes.json().catch(() => ({ error: 'Payment initialization failed' }));
                            toast.error(errData.error || 'Payment initialization failed');
                            setIsSubmitting(false);
                            return;
                        }
                    } catch (payErr) {
                        console.error('Failed to initialize checkout:', payErr);
                        toast.error('Unable to connect to the payment gateway. Please select another payment method.');
                        setIsSubmitting(false);
                        return;
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

    const deliveryFeeCalc = deliveryType === 'delivery' ? (deliveryQuote?.fee || 0) : 0;
    const finalTotal = taxData?.total || (totalPrice + deliveryFeeCalc);
    const tax = taxData?.tax || 0;
    const rule = taxData?.rule || { name: 'Tax', rate: 0 };

    // Bank Transfer confirmation screen
    if (bankTransferOrderId && tenant) {
        const bankName = tenant.business_config?.bank_name || '';
        const accountNumber = tenant.business_config?.bank_account_number || '';
        const accountName = tenant.business_config?.bank_account_name || '';

        const copyAccountNumber = () => {
            navigator.clipboard.writeText(accountNumber);
            setCopiedAccount(true);
            setTimeout(() => setCopiedAccount(false), 2000);
        };

        return (
            <div className={styles.emptyCart} style={{ minHeight: '60vh' }}>
                <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '480px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ color: 'var(--color-primary, #00798C)', marginBottom: '1rem' }}>
                        <Building2 size={64} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Transfer Payment</h2>
                    <p style={{ fontSize: '14px', opacity: 0.7, textAlign: 'center', marginBottom: '1.5rem' }}>
                        Transfer <strong>{CurrencyService.format(CurrencyService.convert(finalTotal, 'NGN', currency), currency)}</strong> to the account below to complete your order.
                    </p>

                    <div style={{
                        width: '100%', background: 'var(--bg-card, #fff)', border: '2px solid var(--border-subtle, #e2e8f0)',
                        borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>Bank</p>
                                <p style={{ fontSize: '16px', fontWeight: 700 }}>{bankName}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>Account Number</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <p style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.1em' }}>{accountNumber}</p>
                                    <button
                                        onClick={copyAccountNumber}
                                        style={{
                                            padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                            border: '1px solid var(--border-subtle, #e2e8f0)', background: 'var(--bg-secondary, #f8fafc)',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                                        }}
                                    >
                                        {copiedAccount ? <Check size={14} /> : <Copy size={14} />}
                                        {copiedAccount ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>Account Name</p>
                                <p style={{ fontSize: '16px', fontWeight: 700 }}>{accountName}</p>
                            </div>
                            <div style={{ borderTop: '1px dashed var(--border-subtle, #e2e8f0)', paddingTop: '1rem' }}>
                                <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>Amount</p>
                                <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary, #00798C)' }}>
                                    {CurrencyService.format(CurrencyService.convert(finalTotal, 'NGN', currency), currency)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        width: '100%', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px',
                        padding: '1rem', marginBottom: '1.5rem', fontSize: '13px', lineHeight: 1.5
                    }}>
                        <p><strong>Order ID:</strong> {bankTransferOrderId.slice(0, 8).toUpperCase()}</p>
                        <p style={{ marginTop: '0.5rem' }}>After transferring, the seller will confirm your payment and process your order. You&apos;ll receive a notification once confirmed.</p>
                    </div>

                    <button
                        onClick={() => router.push(`/store/${subdomain}`)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem' }}
                    >
                        Done - Back to Store
                    </button>
                </div>
            </div>
        );
    }

    if (orderSuccess) {
        return (
            <div className={styles.emptyCart} style={{ minHeight: '60vh' }}>
                <div className="animate-entrance" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: 'var(--color-success)', marginBottom: '1.5rem' }}>
                        <CheckCircle size={80} />
                    </div>
                    <h1 className="gradient-text">Order Confirmed!</h1>
                    <p style={{ maxWidth: '400px', margin: '1rem auto', textAlign: 'center' }}>
                        Your order for <strong>{tenant?.name}</strong> has been received.
                        {paymentMethod === 'pay_on_delivery'
                            ? ' Please have the exact amount ready when your order arrives.'
                            : ' A confirmation has been sent to your email.'}
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
    const hasOnlinePayment = !!(
        (tenant?.business_config?.paystack_public_key && tenant?.business_config?.preferred_payment_gateway === 'paystack') ||
        (tenant?.business_config?.flutterwave_public_key && tenant?.business_config?.preferred_payment_gateway === 'flutterwave')
    );

    return (
        <div className={styles.checkoutPage}>
            <div className={styles.progressHeader}>
                {[
                    { step: 1, label: 'Information' },
                    { step: 2, label: 'Payment' }
                ].map((s) => (
                    <div key={s.step} className={`${styles.stepIndicator} ${currentStep >= s.step ? styles.stepActive : ''}`}>
                        <div className={styles.stepCircle}>{currentStep > s.step ? '✓' : s.step}</div>
                        <span>{s.label}</span>
                        {s.step < 2 && <div className={styles.stepLine} />}
                    </div>
                ))}
            </div>

            <div className={styles.checkoutGrid}>
                <div className={styles.checkoutForm}>
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {/* WhatsApp Fast Checkout */}
                            {tenant?.business_config?.whatsapp_checkout_enabled && (
                                <div className="card animate-entrance" style={{ border: '1.5px solid #25D366', background: '#f0fdf4' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#075E54', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MessageCircle size={16} /> Fast Checkout via WhatsApp
                                    </h4>
                                    <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '1rem' }}>
                                        Skip the forms and complete your order directly in chat.
                                    </p>
                                    <button
                                        onClick={handleWhatsAppCheckout}
                                        disabled={isSubmitting}
                                        className="btn"
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '10px',
                                            backgroundColor: '#25D366', color: 'white', fontWeight: 700,
                                            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <MessageCircle size={18} />}
                                        Start WhatsApp Checkout
                                    </button>
                                </div>
                            )}

                            <div className="card animate-entrance">
                                {/* Express Checkout for returning customers */}
                                <ExpressCheckout
                                    subdomain={subdomain}
                                    onApply={(customer) => {
                                        setFormData({
                                            name: customer.name,
                                            email: customer.email,
                                            phone: customer.phone,
                                        });
                                        if (customer.address) setAddress(customer.address);
                                    }}
                                />
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

                                <div className={styles.divider} style={{ margin: '1.5rem 0' }} />

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

                                <button
                                    className="btn btn-primary"
                                    onClick={nextStep}
                                    disabled={!formData.name || !formData.email || !formData.phone || (deliveryType === 'delivery' && !deliveryQuote)}
                                    style={{ marginTop: '2rem', width: '100%' }}
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="card animate-entrance">
                            <h3 className={styles.cardTitle}>Payment Method</h3>
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

                            {/* Payment Method Selection */}
                            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {hasOnlinePayment && (
                                    <div
                                        onClick={() => setPaymentMethod('online')}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                            border: paymentMethod === 'online' ? '2px solid var(--color-primary, #00798C)' : '2px solid var(--border-subtle)',
                                            background: paymentMethod === 'online' ? 'var(--color-primary-light, #f0fdf4)' : 'transparent'
                                        }}
                                    >
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: paymentMethod === 'online' ? 'var(--color-primary, #00798C)' : '#f1f5f9',
                                            color: paymentMethod === 'online' ? 'white' : '#94a3b8'
                                        }}>
                                            <CreditCard size={20} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '14px' }}>Pay Online (Card / USSD / Bank)</p>
                                            <p style={{ fontSize: '12px', opacity: 0.6 }}>Pay securely via card, USSD, or online transfer</p>
                                        </div>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', border: '2px solid',
                                            borderColor: paymentMethod === 'online' ? 'var(--color-primary, #00798C)' : '#cbd5e1',
                                            background: paymentMethod === 'online' ? 'var(--color-primary, #00798C)' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {paymentMethod === 'online' && <Check size={12} color="white" />}
                                        </div>
                                    </div>
                                )}

                                {tenant?.business_config?.payment_methods?.includes('bank_transfer') && (
                                    <div
                                        onClick={() => setPaymentMethod('bank_transfer')}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                            border: paymentMethod === 'bank_transfer' ? '2px solid var(--color-primary, #00798C)' : '2px solid var(--border-subtle)',
                                            background: paymentMethod === 'bank_transfer' ? 'var(--color-primary-light, #f0fdf4)' : 'transparent'
                                        }}
                                    >
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: paymentMethod === 'bank_transfer' ? 'var(--color-primary, #00798C)' : '#f1f5f9',
                                            color: paymentMethod === 'bank_transfer' ? 'white' : '#94a3b8'
                                        }}>
                                            <Building2 size={20} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '14px' }}>Bank Transfer</p>
                                            <p style={{ fontSize: '12px', opacity: 0.6 }}>Transfer to seller&apos;s bank account</p>
                                        </div>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', border: '2px solid',
                                            borderColor: paymentMethod === 'bank_transfer' ? 'var(--color-primary, #00798C)' : '#cbd5e1',
                                            background: paymentMethod === 'bank_transfer' ? 'var(--color-primary, #00798C)' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {paymentMethod === 'bank_transfer' && <Check size={12} color="white" />}
                                        </div>
                                    </div>
                                )}

                                {tenant?.business_config?.payment_methods?.includes('pay_on_delivery') && (
                                    <div
                                        onClick={() => setPaymentMethod('pay_on_delivery')}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                            borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                            border: paymentMethod === 'pay_on_delivery' ? '2px solid var(--color-primary, #00798C)' : '2px solid var(--border-subtle)',
                                            background: paymentMethod === 'pay_on_delivery' ? 'var(--color-primary-light, #f0fdf4)' : 'transparent'
                                        }}
                                    >
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: paymentMethod === 'pay_on_delivery' ? 'var(--color-primary, #00798C)' : '#f1f5f9',
                                            color: paymentMethod === 'pay_on_delivery' ? 'white' : '#94a3b8'
                                        }}>
                                            <Banknote size={20} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: '14px' }}>Pay on Delivery</p>
                                            <p style={{ fontSize: '12px', opacity: 0.6 }}>Pay cash when you receive your order</p>
                                        </div>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', border: '2px solid',
                                            borderColor: paymentMethod === 'pay_on_delivery' ? 'var(--color-primary, #00798C)' : '#cbd5e1',
                                            background: paymentMethod === 'pay_on_delivery' ? 'var(--color-primary, #00798C)' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {paymentMethod === 'pay_on_delivery' && <Check size={12} color="white" />}
                                        </div>
                                    </div>
                                )}

                                {/* WhatsApp checkout option */}
                                <div
                                    onClick={() => setPaymentMethod('whatsapp')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                                        border: paymentMethod === 'whatsapp' ? '2px solid #25D366' : '2px solid var(--border-subtle)',
                                        background: paymentMethod === 'whatsapp' ? '#f0fdf4' : 'transparent'
                                    }}
                                >
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: paymentMethod === 'whatsapp' ? '#25D366' : '#f1f5f9',
                                        color: paymentMethod === 'whatsapp' ? 'white' : '#94a3b8'
                                    }}>
                                        <MessageCircle size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '14px' }}>WhatsApp Checkout</p>
                                        <p style={{ fontSize: '12px', opacity: 0.6 }}>Complete your order via WhatsApp chat</p>
                                    </div>
                                    <div style={{
                                        width: 20, height: 20, borderRadius: '50%', border: '2px solid',
                                        borderColor: paymentMethod === 'whatsapp' ? '#25D366' : '#cbd5e1',
                                        background: paymentMethod === 'whatsapp' ? '#25D366' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {paymentMethod === 'whatsapp' && <Check size={12} color="white" />}
                                    </div>
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

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" className="btn btn-ghost" onClick={prevStep} style={{ flex: 1 }}>Back</button>
                                    {paymentMethod === 'whatsapp' ? (
                                        <button
                                            type="button"
                                            onClick={handleWhatsAppCheckout}
                                            disabled={isSubmitting || !agreedToTerms}
                                            className="btn"
                                            style={{
                                                flex: 2, padding: '0.875rem', borderRadius: '12px',
                                                backgroundColor: '#25D366', color: 'white', fontWeight: 'bold',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                border: 'none', opacity: agreedToTerms ? 1 : 0.6
                                            }}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <MessageCircle size={18} />}
                                            Checkout on WhatsApp
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !agreedToTerms}
                                            className="btn btn-primary"
                                            style={{
                                                flex: 2,
                                                backgroundColor: tenant?.branding_config?.primaryColor || '#00798C',
                                                opacity: agreedToTerms ? 1 : 0.6
                                            }}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> :
                                                paymentMethod === 'bank_transfer' ? <Building2 size={18} /> :
                                                paymentMethod === 'pay_on_delivery' ? <Banknote size={18} /> :
                                                <CreditCard size={18} />}
                                            {paymentMethod === 'bank_transfer' ? 'Place Order' :
                                             paymentMethod === 'pay_on_delivery' ? 'Place Order (Pay on Delivery)' :
                                             `Pay ${CurrencyService.format(CurrencyService.convert(finalTotal, 'NGN', currency), currency)}`}
                                        </button>
                                    )}
                                </div>
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
