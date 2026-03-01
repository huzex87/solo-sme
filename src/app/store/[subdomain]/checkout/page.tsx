'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { getTranslation, Locale } from '@/lib/i18n';
import styles from '../store.module.css';
import { LogisticsService, DeliveryQuote, Location } from '@/services/logisticsService';
import { OrderService } from '@/services/orderService';
import { TenantService, Tenant } from '@/services/tenantService';
import { MapPin, Truck, Store, CreditCard, ChevronRight, Loader2, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart, locale } = useCart();
    const t = getTranslation(locale as Locale);
    const params = useParams();
    const router = useRouter();
    const subdomain = params.subdomain as string;

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
                    const quote = await LogisticsService.getDeliveryQuote(origin, address);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        setIsSubmitting(true);
        try {
            const finalAmount = totalPrice + (deliveryType === 'delivery' ? (deliveryQuote?.fee || 0) : 0);

            const orderData = {
                tenant_id: tenant.id,
                customer_name: formData.name,
                customer_email: formData.email,
                total_amount: finalAmount,
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
                    <h3>Refreshing Strategy...</h3>
                    <p>Redirecting to cart to secure your selections.</p>
                </div>
            </div>
        );
    }

    const deliveryFee = deliveryType === 'delivery' ? (deliveryQuote?.fee || 0) : 0;
    const finalTotal = totalPrice + deliveryFee;

    return (
        <div className={styles.checkoutPage}>
            <div className={styles.checkoutHeader}>
                <h1 className={styles.checkoutTitle}>Secure Checkout</h1>
                <div className={styles.breadcrumb}>
                    <span>Cart</span> <ChevronRight size={14} /> <span style={{ color: 'var(--text-primary)' }}>Checkout</span>
                </div>
            </div>

            <div className={styles.checkoutGrid}>
                <form onSubmit={handleSubmit} className={styles.checkoutForm}>
                    <div className="card">
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
                    </div>

                    <div className="card">
                        <h3 className={styles.cardTitle}>Fulfillment Strategy</h3>
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
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || (deliveryType === 'delivery' && !deliveryQuote)}
                        className={`btn btn-primary ${styles.placeOrderBtn}`}
                        style={{ backgroundColor: tenant?.brand_color }}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                        Place Order • ₦{finalTotal.toLocaleString()}
                    </button>
                </form>

                <div className={styles.orderSummary}>
                    <div className="card">
                        <h3 className={styles.cardTitle}>Intelligence Summary</h3>
                        <div className={styles.summaryItems}>
                            {items.map(item => (
                                <div key={item.id} className={styles.summaryItem}>
                                    <div className={styles.sumInfo}>
                                        <span className={styles.sumName}>{item.name}</span>
                                        <span className={styles.sumQty}>Qty: {item.quantity}</span>
                                    </div>
                                    <span className={styles.sumPrice}>₦{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₦{totalPrice.toLocaleString()}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Fulfillment</span>
                            <span>{deliveryFee > 0 ? `₦${deliveryFee.toLocaleString()}` : 'FREE'}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>₦{finalTotal.toLocaleString()}</span>
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
