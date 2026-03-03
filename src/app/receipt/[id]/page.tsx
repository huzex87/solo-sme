'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { QRService } from '@/services/qrService';
import styles from './receipt.module.css';

export default function PublicReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [receipt, setReceipt] = useState<any>(null);
    const [qrCode, setQrCode] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReceipt() {
            setLoading(true);
            const { data, error } = await supabase
                .from('receipts')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setReceipt(data);
                const qr = await QRService.getReceiptQR(data.id);
                setQrCode(qr);
            }
            setLoading(false);
        }
        fetchReceipt();
    }, [id]);

    if (loading) return <div className={styles.receiptContainer}><p>Verifying Receipt...</p></div>;
    if (!receipt) return <div className={styles.receiptContainer}><p>Receipt Not Found</p></div>;

    const { data: d } = receipt;

    return (
        <main className={styles.receiptContainer}>
            <div className={styles.header}>
                <div className={styles.logo}>SOLO</div>
                <div style={{ marginBottom: '0.5rem' }}>E-Receipt</div>
                <span className={styles.status}>Paid & Verified</span>
            </div>

            <div className={styles.receiptInfo}>
                <span>#{d.receipt_number}</span>
                <span>{new Date(d.date).toLocaleDateString()}</span>
            </div>

            <div className={styles.items}>
                {d.items.map((item: any, idx: number) => (
                    <div key={idx} className={styles.item}>
                        <div>
                            <div className={styles.itemName}>{item.name}</div>
                            <div className={styles.itemQty}>Qty: {item.quantity} × ₦{item.price.toLocaleString()}</div>
                        </div>
                        <div className={styles.itemPrice}>₦{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                ))}
            </div>

            <div className={styles.summary}>
                <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>₦{(d.total / 1.075).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span>VAT (7.5%)</span>
                    <span>₦{(d.total - (d.total / 1.075)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className={styles.totalRow}>
                    <span>Total</span>
                    <span>₦{d.total.toLocaleString()}</span>
                </div>
            </div>

            <div className={styles.qrCode}>
                {qrCode && <img src={qrCode} alt="Receipt QR" className={styles.qrImage} />}
                <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Scan to verify this transaction</p>
            </div>

            <div className={styles.btnGroup}>
                <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ Print PDF</button>
                <button className="btn btn-primary" onClick={() => window.location.href = '/'}>🏠 Back Home</button>
            </div>

            <div className={styles.footer}>
                <p>Thank you for shopping with us!</p>
                <p style={{ marginTop: '0.5rem' }}>Powered by SOLO SME Platform</p>
            </div>
        </main>
    );
}
