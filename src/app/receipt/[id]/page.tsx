'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { QRService } from '@/services/qrService';
import { formatCurrency } from '@/lib/utils';
import styles from './receipt.module.css';

interface ReceiptData {
    id: string;
    receipt_number: string;
    date: string;
    items: { name: string; quantity: number; price: number }[];
    total: number;
}

export default function PublicReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [receipt, setReceipt] = useState<{ id: string; data: ReceiptData } | null>(null);
    const [qrCode, setQrCode] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReceipt() {
            setLoading(true);
            const supabase = createClient();
            const { data } = await supabase
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
                {d.items?.map((item, idx: number) => (
                    <div key={idx} className={styles.item}>
                        <div>
                            <div className={styles.itemName}>{item.name}</div>
                            <div className={styles.itemQty}>Qty: {item.quantity} × {formatCurrency(item.price)}</div>
                        </div>
                        <div className={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                ))}
            </div>

            <div className={styles.summary}>
                <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(d.total / 1.075)}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span>VAT (7.5%)</span>
                    <span>{formatCurrency(d.total - (d.total / 1.075))}</span>
                </div>
                <div className={styles.totalRow}>
                    <span>Total</span>
                    <span>{formatCurrency(d.total)}</span>
                </div>
            </div>

            <div className={styles.qrCode}>
                {qrCode && <Image src={qrCode} alt="Receipt QR" width={150} height={150} className={styles.qrImage} />}
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
