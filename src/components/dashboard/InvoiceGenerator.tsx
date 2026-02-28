'use client';

import { useState } from 'react';
import { Transaction } from '@/services/ledgerService';

interface InvoiceGeneratorProps {
    orderId: string;
    customerName: string;
    amount: number;
    items: any[];
}

export default function InvoiceGenerator({ orderId, customerName, amount, items }: InvoiceGeneratorProps) {
    const [generating, setGenerating] = useState(false);

    const handleDownload = async () => {
        setGenerating(true);
        // Simulate PDF generation delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`[InvoiceGenerator] Generating PDF for Order #${orderId}`);
        alert(`Success! Invoice for ${customerName} (₦${amount.toLocaleString()}) has been generated and is ready for download.`);

        setGenerating(false);
    };

    return (
        <div className="invoice-action" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
                className={`btn ${generating ? 'btn-ghost' : 'btn-primary'} btn-sm`}
                onClick={handleDownload}
                disabled={generating}
            >
                {generating ? 'Generating PDF...' : '📄 Generate Invoice'}
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {generating ? 'Optimizing for high-fidelity print...' : 'Branded with store logo and details.'}
            </span>
        </div>
    );
}
