import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { formatCurrency } from '@/lib/formatCurrency';
import { WhatsAppUtils } from '@/lib/whatsapp';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SupabaseClient } from '@supabase/supabase-js';
import { OrderService } from './orderService';

export interface InvoiceItem {
    name: string;
    quantity: number;
    price: number;
}

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
    items?: InvoiceItem[];
}

export const InvoiceService = {
    getClient(client?: SupabaseClient): SupabaseClient {
        return client || createClient();
    },

    async getInvoices(tenantId: string, client?: SupabaseClient): Promise<Invoice[]> {
        if (!isSupabaseConfigured) return this.getMockInvoices(tenantId);
        const supabase = this.getClient(client);
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[InvoiceService] Error fetching invoices:', error);
            return this.getMockInvoices(tenantId);
        }

        return data || [];
    },

    async generateInvoicePdf(invoice: Invoice): Promise<void> {
        let items: InvoiceItem[] | undefined = invoice.items;

        // If items are missing, try to fetch the related order
        if (!items || items.length === 0) {
            try {
                const order = await OrderService.getOrder(invoice.order_id);
                if (order && order.items) {
                    items = order.items.map(item => ({
                        name: item.name || 'Product',
                        quantity: item.quantity || 1,
                        price: item.price || 0
                    }));
                }
            } catch (err) {
                console.warn('[InvoiceService] Could not fetch order items for PDF:', err);
            }
        }

        // Fallback if still empty
        if (!items || items.length === 0) {
            items = [{ name: 'Business Services / Products', quantity: 1, price: invoice.total_amount }];
        }

        const doc = new jsPDF();
        const primaryColor: [number, number, number] = [0, 121, 140]; // SOLO Teal

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
        autoTable(doc, {
            startY: 80,
            head: [['Description', 'Quantity', 'Unit Price', 'Total']],
            body: items.map(item => [
                item.name,
                item.quantity.toString(),
                formatCurrency(item.price),
                formatCurrency(item.price * item.quantity)
            ]),
            headStyles: { fillColor: primaryColor },
            theme: 'striped'
        });

        // Totals
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
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
        const link = WhatsAppUtils.buildChatLink(phone, message);
        if (link) window.open(link, '_blank');
    }
};
