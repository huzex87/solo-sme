import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/formatCurrency';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Invoice {
    id: string;
    order_id: string;
    tenant_id: string;
    invoice_number: string;
    status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
    due_date: string;
    total_amount: number;
    customer_name: string;
    customer_email: string;
    created_at: string;
}

export const InvoiceService = {
    async getInvoices(tenantId: string): Promise<Invoice[]> {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[InvoiceService] Error fetching invoices:', error);
            // Fallback for demo/missing table
            return this.getMockInvoices(tenantId);
        }

        return data || [];
    },

    async generateInvoicePdf(invoice: Invoice): Promise<void> {
        const doc = new jsPDF();
        const primaryColor = [0, 121, 140]; // SOLO Teal

        // Header & Branding
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('SOLO.', 20, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('OFFICIAL DIGITAL INVOICE', 140, 25);

        // Invoice Details
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(10);
        doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, 55);
        doc.text(`Date Issued: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 60);
        doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 65);

        // Customer Details
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO:', 140, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(invoice.customer_name, 140, 60);
        doc.text(invoice.customer_email, 140, 65);

        // Table Integration (Items)
        // For now using the total as a single line since we don't have item breakdown in the invoice list
        autoTable(doc, {
            startY: 80,
            head: [['Description', 'Quantity', 'Unit Price', 'Total']],
            body: [
                ['Business Services / Products', '1', formatCurrency(invoice.total_amount), formatCurrency(invoice.total_amount)]
            ],
            headStyles: { fillColor: primaryColor as [number, number, number] },
            theme: 'striped'
        });

        // Totals
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL AMOUNT: ${formatCurrency(invoice.total_amount)}`, 140, finalY);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('This is a digitally generated invoice powered by SOLO Market Energy.', 20, 280);
        doc.text('www.solo-sme.com', 170, 280);

        doc.save(`${invoice.invoice_number}.pdf`);
    },

    getMockInvoices(tenantId: string): Invoice[] {
        return [
            {
                id: '1',
                order_id: 'ord_1',
                tenant_id: tenantId,
                invoice_number: 'INV-2026-001',
                status: 'paid',
                due_date: new Date(Date.now() + 86400000 * 7).toISOString(),
                total_amount: 45000,
                customer_name: 'Amaka Obi',
                customer_email: 'amaka@example.com',
                created_at: new Date().toISOString()
            },
            {
                id: '2',
                order_id: 'ord_2',
                tenant_id: tenantId,
                invoice_number: 'INV-2026-002',
                status: 'issued',
                due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
                total_amount: 12500,
                customer_name: 'Tunde Afolayan',
                customer_email: 'tunde@business.ng',
                created_at: new Date().toISOString()
            },
            {
                id: '3',
                order_id: 'ord_3',
                tenant_id: tenantId,
                invoice_number: 'INV-2026-003',
                status: 'overdue',
                due_date: new Date(Date.now() - 86400000 * 2).toISOString(),
                total_amount: 8900,
                customer_name: 'Koffi Mensah',
                customer_email: 'koffi@accra.market',
                created_at: new Date(Date.now() - 86400000 * 10).toISOString()
            }
        ];
    },

    shareInvoiceToWhatsApp(phone: string, invoice: Invoice) {
        const message = `Hello ${invoice.customer_name}, here is your invoice ${invoice.invoice_number} from SOLO Merchant for ${formatCurrency(invoice.total_amount)}. View it here: [Invoicing Link]`;
        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    }
};
