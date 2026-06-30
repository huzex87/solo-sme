'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ProductService, Product } from '@/services/productService';
import { InventoryService } from '@/services/inventoryService';
import { OrderService } from '@/services/orderService';
import { ReceiptService } from '@/services/receiptService';
import { useTenant } from '@/context/TenantContext';
import { useToast } from '@/components/ui/ToastProvider';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { CustomerService, Customer } from '@/services/customerService';
import { POSQueueService } from '@/services/posQueueService';
import { LoyaltyService, LoyaltyAccount } from '@/services/loyaltyService';
import { Search, Camera, ShoppingCart, Trash2, Package, ChevronRight, Mic, MicOff, User, Gift, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import BarcodeScanner from '@/components/dashboard/BarcodeScanner';
import styles from './pos.module.css';
import EmptyState from '@/components/shared/EmptyState';
import { formatCurrency } from '@/lib/formatCurrency';
import { usePermissions } from '@/hooks/usePermissions';

interface CartItem extends Product {
    quantity: number;
}

interface IWebkitSpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onstart: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: { error: string }) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

interface SpeechRecognitionEvent {
    results: {
        [key: number]: {
            [key: number]: {
                transcript: string;
            };
        };
    };
}

export default function POSPage() {
    const { tenantId, tenant } = useTenant();
    const { showToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [predictiveData, setPredictiveData] = useState<{ id: string; status: string }[]>([]);
    const [lastReceipt, setLastReceipt] = useState<{ id: string; receipt_number: string } | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [sharePhone, setSharePhone] = useState('234');
    const [showShareInput, setShowShareInput] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);
    const [appliedPoints, setAppliedPoints] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);
    const [queueSize, setQueueSize] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const { can } = usePermissions();
    const recognitionRef = useRef<IWebkitSpeechRecognition | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const fetchProducts = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        const [pData, sData, cData] = await Promise.all([
            ProductService.getProducts(tenantId),
            InventoryService.getPredictiveStockAnalysis(tenantId),
            CustomerService.getCustomers(tenantId)
        ]);
        setProducts(pData);
        setPredictiveData(sData || []);
        setCustomers(cData);
        setLoading(false);
    }, [tenantId]);

    useEffect(() => {
        fetchProducts();

        // Subscribe to real-time inventory updates
        const supabase = createClient();
        const channel = supabase
            .channel('pos-inventory-sync')
            // @ts-ignore
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'products',
                filter: `tenant_id=eq.${tenantId}`
            }, (payload: { eventType: string; new: { id: string; stock_quantity: number } }) => {
                logger.debug('POS Inventory update received', { event: payload.eventType });
                if (payload.eventType === 'UPDATE') {
                    setProducts(prev => prev.map((p: Product) =>
                        p.id === payload.new.id ? { ...p, stock_quantity: payload.new.stock_quantity } : p
                    ));
                } else {
                    fetchProducts();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchProducts, tenantId]);

    // Handle barcode scanning (mock/input based)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // If user presses '/' focus search
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        async function fetchLoyalty() {
            if (selectedCustomerId) {
                const account = await LoyaltyService.getAccount(selectedCustomerId);
                setLoyaltyAccount(account);
            } else {
                setLoyaltyAccount(null);
                setAppliedPoints(0);
            }
        }
        fetchLoyalty();
    }, [selectedCustomerId]);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Update queue size every few seconds
        const interval = setInterval(() => {
            setQueueSize(POSQueueService.getQueue().length);
        }, 5000);
        setQueueSize(POSQueueService.getQueue().length);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    const handleSync = async () => {
        if (!isOnline || isSyncing) return;
        setIsSyncing(true);
        try {
            const result = await POSQueueService.syncQueue();
            if (result.success > 0) {
                showToast(`Synced ${result.success} transactions`, 'success');
                await fetchProducts(); // Refresh stock
            }
            if (result.failed > 0) {
                showToast(`Failed to sync ${result.failed} transactions`, 'error');
            }
            setQueueSize(POSQueueService.getQueue().length);
        } catch {
            showToast('Sync failed', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const addToCart = (product: Product) => {
        if (product.stock_quantity <= 0) {
            showToast('Item is out of stock', 'error');
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock_quantity) {
                    showToast('Cannot add more than available stock', 'error');
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                if (newQty <= 0) return null;
                if (newQty > (item.stock_quantity || 0)) {
                    showToast('Max stock reached', 'error');
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean) as CartItem[]);
    };

    const clearCart = () => {
        const previousCart = [...cart];
        setCart([]);
        showToast('Cart cleared', 'info', {
            label: 'Undo',
            onClick: () => setCart(previousCart)
        });
    };

    const handleBarcodeScan = (barcode: string) => {
        const product = products.find(p => p.barcode === barcode || p.sku === barcode);
        if (product) {
            addToCart(product);
            showToast(`Added ${product.name}`, 'success');
            setShowScanner(false);
        } else {
            showToast(`Product with barcode ${barcode} not found`, 'error');
        }
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discount = LoyaltyService.getDiscountValue(appliedPoints);
    const tax = (subtotal - discount) * 0.075; // 7.5% VAT Nigeria
    const total = Math.max(0, subtotal - discount + tax);

    const handleCheckout = async () => {
        if (cart.length === 0 || isProcessing) return;

        setIsProcessing(true);
        showToast('Processing...', 'info');

        try {
            const customer = customers.find(c => c.id === selectedCustomerId);

            // 1. Create Order record
            const orderData = {
                tenant_id: tenantId as string,
                customer_name: customer?.full_name || 'Walk-in Customer',
                customer_email: customer?.email || tenant?.business_config?.email || 'retail@solo-sme.com',
                customer_id: selectedCustomerId || undefined,
                total_amount: total,
                status: 'paid' as const,
                channel: 'pos' as const,
                payment_method: paymentMethod,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                metadata: {
                    loyalty_points_redeemed: appliedPoints,
                    loyalty_discount: discount
                }
            };

            const order = await OrderService.createOrder(orderData);

            if (!order) {
                // If createOrder returns null but we're online, something else is wrong
                if (isOnline) {
                    throw new Error('Failed to create POS order');
                } else {
                    // This case shouldn't hit with the try/catch but added for safety
                    POSQueueService.queueTransaction(orderData);
                    showToast('Offline: Transaction queued', 'info');
                    setQueueSize(prev => prev + 1);
                    setCart([]);
                    return;
                }
            }

            showToast('Sale completed!', 'success');
            setLastReceipt(null); // Receipt generation deferred to sync for offline
            if (order.id) {
                const receipt = await ReceiptService.generateReceipt(order.id, tenantId as string);
                setLastReceipt(receipt);
                setShowSuccessModal(true);
            }
            setCart([]);
            setAppliedPoints(0);
            setSelectedCustomerId('');
            await fetchProducts();
        } catch (error) {
            if (!isOnline) {
                const orderData = {
                    tenant_id: tenantId as string,
                    customer_name: (customers.find(c => c.id === selectedCustomerId))?.full_name || 'Walk-in Customer',
                    customer_email: (customers.find(c => c.id === selectedCustomerId))?.email || tenant?.business_config?.email || 'retail@solo-sme.com',
                    customer_id: selectedCustomerId || undefined,
                    total_amount: total,
                    status: 'paid' as const,
                    channel: 'pos' as const,
                    payment_method: paymentMethod,
                    items: cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    }))
                };
                POSQueueService.queueTransaction(orderData);
                showToast('Offline: Transaction queued locally', 'info');
                setQueueSize(prev => prev + 1);
                setCart([]);
            } else {
                logger.error('POS Checkout failed', error);
                showToast('Transaction failed. Please try again.', 'error');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleVoice = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const GlobalWindow = window as unknown as { SpeechRecognition: unknown; webkitSpeechRecognition: unknown };
        const SpeechRecognition = (GlobalWindow.SpeechRecognition || GlobalWindow.webkitSpeechRecognition) as new () => { continuous: boolean; interimResults: boolean; lang: string; onresult: ((e: { results: SpeechRecognitionResultList }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start(): void; stop(): void };

        if (!SpeechRecognition) {
            showToast('Voice search not supported in this browser', 'error');
            return;
        }

        const recognition = new SpeechRecognition() as unknown as IWebkitSpeechRecognition;
        recognition.lang = 'en-NG'; // Nigerian English
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            showToast('Listening for product name...', 'info');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            showToast(`Searching for: ${transcript}`, 'info');

            // Try to find matching product
            const match = products.find(p => transcript.includes(p.name.toLowerCase()));
            if (match) {
                addToCart(match);
                showToast(`Added ${match.name} to cart`, 'success');
            } else {
                setSearch(transcript);
                showToast(`No exact match for "${transcript}"`, 'info');
            }
            setIsListening(false);
        };

        recognition.onerror = (event: { error: string }) => {
            logger.error('Speech recognition error', { error: event.error });
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search)
    );

    return (
        <div className={styles.posContainer}>
            <div className={styles.productSection}>
                <div className={styles.searchBar}>
                    <div className={styles.searchInputWrapper}>
                        <div className={styles.searchIconWrapper}>
                            <Search size={22} strokeWidth={2.5} />
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search product or scan barcode... [ / ]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className={styles.searchActions}>
                        {queueSize > 0 && (
                            <button
                                className={`${styles.syncBtn} ${isSyncing ? styles.syncing : ''}`}
                                onClick={handleSync}
                                title="Sync Pending Transactions"
                                disabled={!isOnline || isSyncing}
                            >
                                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                                <span>{queueSize}</span>
                            </button>
                        )}
                        <div className={`${styles.connectivityStatus} ${isOnline ? styles.online : styles.offline}`}>
                            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                        <button className={styles.barcodeBtn} onClick={() => setShowScanner(true)}>
                            <Camera size={18} />
                            <span>Scan</span>
                        </button>
                        <button
                            className={`${styles.voiceBtn} ${isListening ? styles.listening : ''}`}
                            onClick={toggleVoice}
                            title="Voice Search"
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                    </div>
                </div>

                {showScanner && (
                    <BarcodeScanner
                        onScan={handleBarcodeScan}
                        onClose={() => setShowScanner(false)}
                    />
                )}

                {loading ? (
                    <div className={styles.skeletonGrid}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.skeletonImage} />
                                <div className={styles.skeletonText} />
                                <div className={styles.skeletonTextSmall} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.productGrid}>
                        {filtered.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', padding: '4rem 0' }}>
                                <EmptyState
                                    icon={Package}
                                    title="No Products Found"
                                    description="We couldn't find any products matching your search or barcode scan."
                                    action={{
                                        label: "Clear Search",
                                        onClick: () => setSearch('')
                                    }}
                                />
                            </div>
                        ) : (
                            filtered.map(product => (
                                <div
                                    key={product.id}
                                    className={`
                                        ${styles.productCard} 
                                        ${product.stock_quantity <= 0 ? styles.outOfStock : ''}
                                        ${product.category?.toLowerCase() === 'apparel' ? styles.cardTintApparel : ''}
                                        ${product.category?.toLowerCase() === 'food' || product.category?.toLowerCase() === 'grocery' ? styles.cardTintFood : ''}
                                        ${product.category?.toLowerCase() === 'beauty' ? styles.cardTintBeauty : ''}
                                        ${product.category?.toLowerCase() === 'electronics' || product.category?.toLowerCase() === 'tech' ? styles.cardTintTech : ''}
                                        ${product.category?.toLowerCase() === 'home' ? styles.cardTintHome : ''}
                                    `}
                                    onClick={() => addToCart(product)}
                                >
                                    <div className={styles.productImage}>
                                        {product.image_url ? (
                                            <Image src={product.image_url} alt={product.name} width={100} height={100} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem' }} />
                                        ) : (
                                            <span>📦</span>
                                        )}
                                    </div>
                                    <div className={styles.productInfo}>
                                        <h3>{product.name}</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                                            <span className={`${styles.price} font-mono`}>{formatCurrency(product.price)}</span>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <span className={`${styles.stock} font-mono`}>{product.stock_quantity} in stock</span>
                                                {predictiveData.find(pd => pd.id === product.id)?.status === 'CRITICAL' && (
                                                    <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 800 }}>⚠️ DEPLETING FAST</span>
                                                )}
                                                {predictiveData.find(pd => pd.id === product.id)?.status === 'LOW' && (
                                                    <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 800 }}>⏳ RESTOCK SOON</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className={`${styles.cartOverlay} ${isCartOpen ? styles.cartOverlayActive : ''}`} onClick={() => setIsCartOpen(false)} />

            <div className={`${styles.cartPanel} ${isCartOpen ? styles.cartPanelActive : ''}`}>
                <div className={styles.sheetHandle} onClick={() => setIsCartOpen(false)} />
                <div className={styles.cartHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingCart size={20} color="var(--primary)" />
                        <h2>Current Sale</h2>
                    </div>
                    <button className="btn btn-sm btn-ghost" onClick={clearCart}>
                        <Trash2 size={14} />
                        <span>Clear</span>
                    </button>
                </div>

                <div className={styles.customerSection}>
                    <div className="flex items-center gap-2 mb-2">
                        <User size={16} color="var(--accent-primary)" />
                        <span className="text-xs font-bold uppercase tracking-wider">Customer Selection</span>
                    </div>
                    <select
                        className={styles.customerSelect}
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                        <option value="">Walk-in Customer</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.full_name}</option>
                        ))}
                    </select>

                    {loyaltyAccount && (
                        <div className={styles.loyaltyInfo}>
                            <div className="flex items-center gap-2">
                                <Gift size={14} className="text-primary" />
                                <span className="text-xs font-semibold"><span className={styles.points}>{loyaltyAccount.points}</span> pts available</span>
                            </div>
                            <button
                                className={styles.redeemBtn}
                                onClick={() => {
                                    const maxPoints = Math.min(loyaltyAccount.points, Math.floor(subtotal / 10)); // Max 10% or available
                                    setAppliedPoints(maxPoints);
                                    showToast(`Applied ${maxPoints} points for discount`, 'success');
                                }}
                                disabled={loyaltyAccount.points < 100 || appliedPoints > 0}
                            >
                                {appliedPoints > 0 ? 'Applied' : 'Redeem'}
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.cartItems}>
                    {cart.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                            <p>Customer cart is empty.<br />Select products to start building a sale.</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className={styles.cartItem}>
                                <div className={styles.itemDetails}>
                                    <h4>{item.name}</h4>
                                    <div className={styles.itemQty}>
                                        <button className={styles.qtyBtn} onClick={() => updateQty(item.id, -1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button className={styles.qtyBtn} onClick={() => updateQty(item.id, 1)}>+</button>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.6, marginLeft: '0.5rem' }}>@ {formatCurrency(item.price)}</span>
                                    </div>
                                </div>
                                <div className={`${styles.itemPrice} font-mono`}>
                                    {formatCurrency(item.price * item.quantity)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.cartFooter}>
                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span className="font-mono">{formatCurrency(subtotal)}</span>
                    </div>
                    {appliedPoints > 0 && (
                        <div className={styles.summaryRow}>
                            <span>Loyalty Discount ({appliedPoints} pts)</span>
                            <span className="font-mono">-{formatCurrency(discount)}</span>
                        </div>
                    )}
                    <div className={styles.summaryRow}>
                        <span>Sales Tax (0%)</span>
                        <span className="font-mono">{formatCurrency(0)}</span>
                    </div>
                    <div className={styles.totalRow}>
                        <span>Total</span>
                        <span className="font-mono">{formatCurrency(total)}</span>
                    </div>

                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>PAYMENT METHOD</div>
                    <div className={styles.payGrid}>
                        <div
                            className={`${styles.payMethod} ${paymentMethod === 'cash' ? styles.payMethodActive : ''}`}
                            onClick={() => setPaymentMethod('cash')}
                        >
                            <span style={{ fontSize: '1.25rem' }}>💵</span>
                            CASH
                        </div>
                        <div
                            className={`${styles.payMethod} ${paymentMethod === 'card' ? styles.payMethodActive : ''}`}
                            onClick={() => setPaymentMethod('card')}
                        >
                            <span style={{ fontSize: '1.25rem' }}>💳</span>
                            CARD
                        </div>
                        <div
                            className={`${styles.payMethod} ${paymentMethod === 'transfer' ? styles.payMethodActive : ''}`}
                            onClick={() => setPaymentMethod('transfer')}
                        >
                            <span style={{ fontSize: '1.25rem' }}>🏦</span>
                            BANK
                        </div>
                    </div>

                    <button
                        className={`btn btn-primary ${styles.checkoutBtn}`}
                        disabled={cart.length === 0 || isProcessing || !can('create_order')}
                        onClick={handleCheckout}
                    >
                        {isProcessing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="animate-spin" style={{ borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', width: '16px', height: '16px' }} />
                                Processing...
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{!can('create_order') ? 'Access Denied' : 'Pay & Finish'}</span>
                                <ChevronRight size={20} />
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {showSuccessModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Sale Complete!</h2>
                        <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>Receipt: {lastReceipt?.receipt_number}</p>

                        <div className={styles.modalActions}>
                            {!showShareInput ? (
                                <button
                                    className="btn btn-secondary"
                                    style={{ width: '100%', marginBottom: '0.5rem' }}
                                    onClick={() => setShowShareInput(true)}
                                >
                                    📱 Share via WhatsApp
                                </button>
                            ) : (
                                <div className={styles.shareInputWrapper}>
                                    <input
                                        type="tel"
                                        className="input-field"
                                        value={sharePhone}
                                        onChange={(e) => setSharePhone(e.target.value)}
                                        placeholder="234..."
                                        autoFocus
                                    />
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => {
                                            if (lastReceipt && tenantId) {
                                                ReceiptService.shareToWhatsApp(tenantId, sharePhone, lastReceipt.id, 'SOLO Merchant');
                                                setShowShareInput(false);
                                                showToast('Sharing to WhatsApp...', 'info');
                                            }
                                        }}
                                    >
                                        Send
                                    </button>
                                </div>
                            )}
                            <button
                                className="btn btn-ghost"
                                style={{ width: '100%', marginBottom: '1rem' }}
                                onClick={() => window.print()}
                            >
                                🖨️ Print Receipt
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => setShowSuccessModal(false)}
                            >
                                New Sale
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button className={styles.cartToggle} onClick={() => setIsCartOpen(true)}>
                <ShoppingCart size={20} />
                <span>View Cart • <span className="font-mono">{cart.length}</span></span>
            </button>
        </div>
    );
}
