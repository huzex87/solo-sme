'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { InvoiceService, Invoice } from '@/services/invoiceService';
import { FileText, Download, Share2, MoreVertical, Search, Filter, Loader2, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import styles from './invoices.module.css';
import EmptyState from '@/components/shared/EmptyState';

export default function InvoicesPage() {
    const { tenantId } = useTenant();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [generating, setGenerating] = useState<string | null>(null);

    useEffect(() => {
        async function fetchInvoices() {
            if (!tenantId) return;
            const data = await InvoiceService.getInvoices(tenantId);
            setInvoices(data);
            setLoading(false);
        }
        fetchInvoices();
    }, [tenantId]);

    const filtered = invoices.filter(inv =>
        inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer_name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Digital Invoices</h1>
                    <p className={styles.subtitle}>Manage your professional billing and automated receivables.</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={18} />
                    New Invoice
                </button>
            </div>

            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                        type="text"
                        className="input-field pl-10"
                        placeholder="Search by invoice number or customer name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn btn-outline">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No Invoices Found"
                    description="You haven't created any invoices yet. Professional billing helps you get paid faster."
                />
            ) : (
                <div className={styles.invoiceGrid}>
                    {filtered.map(inv => (
                        <div key={inv.id} className={styles.invoiceCard}>
                            <div className={styles.invoiceInfo}>
                                <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                                    <FileText size={24} />
                                </div>
                                <div className={styles.customer}>
                                    <span className={styles.invNum}>{inv.invoice_number}</span>
                                    <span className={styles.custName}>{inv.customer_name}</span>
                                    <span className={styles.custEmail}>{inv.customer_email}</span>
                                </div>
                                <div className={styles.customer}>
                                    <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Due Date</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{new Date(inv.due_date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className={`${styles.statusTag} ${styles[inv.status]}`}>
                                        {inv.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className={styles.amount}>
                                    {formatCurrency(inv.total_amount)}
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        className={styles.actionBtn}
                                        title="Download PDF"
                                        onClick={async () => {
                                            setGenerating(inv.id);
                                            await InvoiceService.generateInvoicePdf(inv);
                                            setGenerating(null);
                                        }}
                                        disabled={generating === inv.id}
                                    >
                                        {generating === inv.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={18} />}
                                    </button>
                                    <button
                                        className={styles.actionBtn}
                                        title="Share WhatsApp"
                                        onClick={() => InvoiceService.shareInvoiceToWhatsApp('234', inv)}
                                    >
                                        <Share2 size={18} />
                                    </button>
                                    <button className={styles.actionBtn}>
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
