'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ProductService, Product } from '@/services/productService';
import { InventoryService } from '@/services/inventoryService';
import { OrderService } from '@/services/orderService';
import { ReceiptService } from '@/services/receiptService';
import { useTenant } from '@/context/TenantContext';
import { useToast } from '@/components/ui/ToastProvider';
import { supabase } from '@/lib/supabase';
import { Search, Camera, ShoppingCart, Trash2, Plus, Minus, CheckCircle, Smartphone, Printer, Package, ChevronRight } from 'lucide-react';
import BarcodeScanner from '@/components/dashboard/BarcodeScanner';
import styles from './pos.module.css';

interface CartItem extends Product {
    quantity: number;
}

export default function POSPage() {
    const { tenantId } = useTenant();
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

    const searchInputRef = useRef<HTMLInputElement>(null);

    const fetchProducts = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        const [pData, sData] = await Promise.all([
            ProductService.getProducts(tenantId),
            InventoryService.getPredictiveStockAnalysis(tenantId)
        ]);
        setProducts(pData);
        setPredictiveData(sData || []);
        setLoading(false);
    }, [tenantId]);

    useEffect(() => {
        fetchProducts();

        // Subscribe to real-time inventory updates
        const channel = supabase
            .channel('pos-inventory-sync')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'products',
                filter: `tenant_id=eq.${tenantId}`
            }, (payload) => {
                console.log('[POS] Inventory update received:', payload);
                if (payload.eventType === 'UPDATE') {
                    setProducts(prev => prev.map(p =>
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
        if (confirm('Clear entire cart?')) setCart([]);
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
    const tax = subtotal * 0.075; // 7.5% VAT Nigeria
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (cart.length === 0 || isProcessing) return;

        setIsProcessing(true);
        showToast('Processing POS transaction...', 'info');

        try {
            // 1. Create Order record
            const orderData = {
                tenant_id: tenantId as string,
                customer_name: 'Walk-in Customer',
                customer_email: 'retail@solo-sme.com',
                total_amount: total,
                status: 'paid' as const,
                channel: 'pos' as const,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }))
            };

            const order = await OrderService.createOrder(orderData);

            if (!order) throw new Error('Failed to create POS order');

            // 2. Generate Receipt
            const receipt = await ReceiptService.generateReceipt(order.id, tenantId as string);

            showToast('Sale completed successfully!', 'success');
            setLastReceipt(receipt);
            setShowSuccessModal(true);
            setCart([]);
            // Stock is updated via Realtime subscription, but we refresh just in case
            await fetchProducts();
        } catch (error) {
            console.error('[POS] Checkout error:', error);
            showToast('Transaction failed. Please try again.', 'error');
        } finally {
            setIsProcessing(false);
        }
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
                    <div className={styles.searchIconWrapper} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', zIndex: 10 }}>
                        <Search size={22} strokeWidth={2.5} />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="input-field"
                        placeholder="Search product or scan barcode... [ / ]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '3.5rem', height: '4rem', fontSize: '1.25rem', fontWeight: 600, borderRadius: 'var(--radius-xl)' }}
                    />
                    <button className={styles.barcodeBtn} onClick={() => setShowScanner(true)}>
                        <Camera size={18} />
                        Scan
                    </button>
                </div>

                {showScanner && (
                    <BarcodeScanner
                        onScan={handleBarcodeScan}
                        onClose={() => setShowScanner(false)}
                    />
                )}

                {loading ? (
                    <div className="loading">Loading Catalog...</div>
                ) : (
                    <div className={styles.productGrid}>
                        {filtered.map(product => (
                            <div
                                key={product.id}
                                className={`${styles.productCard} ${product.stock_quantity <= 0 ? styles.outOfStock : ''}`}
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
                                        <span className={styles.price}>₦{product.price.toLocaleString()}</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span className={styles.stock}>{product.stock_quantity} in stock</span>
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
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.cartSection}>
                <div className={styles.cartHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingCart size={20} color="var(--accent-primary)" />
                        <h2>Active Cart</h2>
                    </div>
                    <button className="btn btn-sm btn-ghost" onClick={clearCart}>
                        <Trash2 size={14} />
                        <span>Clear</span>
                    </button>
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
                                        <span style={{ fontSize: '0.8rem', opacity: 0.6, marginLeft: '0.5rem' }}>@ ₦{item.price.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className={styles.itemPrice}>
                                    ₦{(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.cartFooter}>
                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>VAT (7.5%)</span>
                        <span>₦{tax.toLocaleString()}</span>
                    </div>
                    <div className={styles.totalRow}>
                        <span>Total Due</span>
                        <span>₦{total.toLocaleString()}</span>
                    </div>
                    <button
                        className={`btn btn-primary ${styles.checkoutBtn}`}
                        disabled={cart.length === 0 || isProcessing}
                        onClick={handleCheckout}
                    >
                        {isProcessing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="animate-spin" style={{ borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', width: '16px', height: '16px' }} />
                                Processing...
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Complete Sale</span>
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
                            <button
                                className="btn btn-secondary"
                                style={{ width: '100%', marginBottom: '0.5rem' }}
                                onClick={() => {
                                    const phone = prompt('Enter customer phone number (with country code):', '234');
                                    if (phone && lastReceipt) ReceiptService.shareToWhatsApp(phone, lastReceipt.id, 'SOLO Merchant');
                                }}
                            >
                                📱 Share via WhatsApp
                            </button>
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
        </div>
    );
}
