import { OrderService } from './orderService';
import { ProductService } from './productService';
import { LedgerService } from './ledgerService';
import { WhatsAppService } from './whatsappService';
import { WhatsAppAuthService, WhatsAppBinding, PendingAction } from './whatsappAuthService';
import { ReceiptService } from './receiptService';
import { CustomerService } from './customerService';
import { LoyaltyService } from './loyaltyService';
import { SegmentationService } from './segmentationService';
import { AnalyticsService } from './analyticsService';
import { InsightsService } from './insightsService';
import { FinanceService } from './financeService';
import { AIAnalyticsService } from './aiAnalyticsService';
import { InventoryService } from './inventoryService';
import { IntentResult, WhatsAppEntities, ResolveProduct, ResolveVoidItem } from './intentEngine';
import { IntentValidator } from './intentValidator';
import { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';

/** Normalises phone to E.164 digits without '+'. Same logic as webhook. */
function normalisePhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 11) return '234' + digits.slice(1);
    return digits;
}

/**
 * WhatsApp Command Service
 * Orchestrates business logic execution for all classified intents.
 */
export class WhatsAppCommandService {
    private static async getClient(injectedClient?: SupabaseClient) {
        if (injectedClient) return injectedClient;
        return await createAdminClient();
    }

    /**
     * Main entry point — routes a classified intent to the correct handler.
     */
    static async execute(phoneNumber: string, binding: WhatsAppBinding | null, result: IntentResult, supabase?: SupabaseClient) {
        if (!binding) {
            if (result.intent === 'LINK_ACCOUNT') {
                return this.handleLinkAccount(phoneNumber, result.entities, supabase);
            }
            return WhatsAppService.sendText(
                phoneNumber,
                "I don't recognize this number with any SOLO account.\n\nReply with your SOLO link code or registered email to get started. 🔗"
            );
        }

        switch (result.intent) {
            case 'RECORD_SALE': return this.handleRecordSale(phoneNumber, binding, result.entities, supabase);
            case 'CHECK_BALANCE': return this.handleCheckBalance(phoneNumber, binding, supabase);
            case 'GET_REVENUE_SUMMARY': return this.handleRevenueSummary(phoneNumber, binding, supabase);
            case 'CHECK_INVENTORY': return this.handleCheckInventory(phoneNumber, binding, result.entities, supabase);
            case 'UPDATE_STOCK': return this.handleUpdateStock(phoneNumber, binding, result.entities, supabase);   // FIX 8
            case 'RECORD_EXPENSE': return this.handleRecordExpense(phoneNumber, binding, result.entities, supabase);
            case 'SEND_RECEIPT': return this.handleSendReceipt(phoneNumber, binding, result.entities, supabase);
            case 'ADD_CUSTOMER': return this.handleAddCustomer(phoneNumber, binding, result.entities, supabase);
            case 'CHECK_LOYALTY': return this.handleCheckLoyalty(phoneNumber, binding, result.entities, supabase);
            case 'SEND_PROMO': return this.handleSendPromo(phoneNumber, binding, result.entities, supabase);
            case 'CHECK_DEBTS': return this.handleCheckDebts(phoneNumber, binding, result.entities, supabase);    // FIX 7
            case 'RECORD_DEBT': return this.handleRecordDebt(phoneNumber, binding, result.entities, supabase);   // FIX 6
            case 'VOID_SALE': return this.handleVoidSale(phoneNumber, binding, result.entities, supabase);     // FIX 5
            case 'GREETING': return this.handleGreeting(phoneNumber, binding, result, supabase);
            case 'MENU': return this.handleMenu(phoneNumber);
            case 'BUSINESS_ADVICE':
            case 'AI_ADVICE': return this.handleAIAdvice(phoneNumber, binding, result.entities, supabase);
            case 'GET_REPORT': return this.handleBusinessReport(phoneNumber, binding, result.entities, supabase);
            case 'LINK_ACCOUNT': return this.handleLinkAccount(phoneNumber, result.entities, supabase);
            case 'VERIFY_OTP': return this.handleVerifyOtp(phoneNumber, result.entities, supabase);
            default:
                return WhatsAppService.sendText(
                    phoneNumber,
                    result.response_text || "I'm not sure how to help with that yet.\n\nType *MENU* to see everything I can do for you. 📋"
                );
        }
    }

    // ─── FIX 4: Confirmation Resolver ───────────────────────────────────────────
    /**
     * Resolves a pending staged action when merchant replies YES or NO.
     * Called directly from the webhook BEFORE intent classification.
     */
    static async resolveConfirmation(
        phoneNumber: string,
        binding: WhatsAppBinding,
        pending: PendingAction,
        confirmed: boolean,
        supabase?: SupabaseClient
    ) {
        await WhatsAppAuthService.clearPendingConfirmation(phoneNumber);

        if (!confirmed) {
            return WhatsAppService.sendText(phoneNumber, "✅ Action cancelled. Nothing was recorded.");
        }

        switch (pending.type) {
            case 'RECORD_SALE':
                return this.commitSale(phoneNumber, binding, pending, supabase);
            case 'RECORD_EXPENSE':
                return this.commitExpense(phoneNumber, binding, pending, supabase);
            case 'SEND_PROMO':
                return this.commitPromo(phoneNumber, binding, pending, supabase);
            case 'VOID_SALE':
                return this.commitVoid(phoneNumber, binding, pending, supabase);
            default:
                return WhatsAppService.sendText(phoneNumber, "Action confirmed but I couldn't find the pending task. Please try again.");
        }
    }

    // ─── FIX 12: Sale uses staging/confirmation flow ─────────────────────────────
    private static async handleRecordSale(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        // Support both single product (legacy) and multi-product (FIX K from intentEngine)
        const productList: Array<{ name: string; quantity: number; price?: number }> =
            entities.products ||
            (entities.product ? [{ name: entities.product, quantity: entities.quantity || 1, price: entities.price }] : []);

        if (productList.length === 0) {
            return WhatsAppService.sendText(phoneNumber, "I couldn't identify the product. What did you sell?");
        }

        // Secondary validation
        const validation = IntentValidator.validateSale(entities);
        if (!validation.valid) {
            return WhatsAppService.sendText(phoneNumber, `⚠️ ${validation.error}`);
        }

        const allProducts = await ProductService.getProducts(binding.tenant_id, supabase);
        const resolved = [];

        for (const entry of productList) {
            const product = allProducts.find(p =>
                p.name.toLowerCase().includes(entry.name.toLowerCase())
            );
            if (!product) {
                return WhatsAppService.sendText(
                    phoneNumber,
                    `I couldn't find "*${entry.name}*" in your inventory. Check the spelling or add it first.`
                );
            }
            resolved.push({
                product,
                quantity: entry.quantity || 1,
                unitPrice: entry.price || product.price
            });
        }

        const totalAmount = resolved.reduce((sum, r) => sum + r.unitPrice * r.quantity, 0);
        const lineItems = resolved.map(r => `• ${r.product.name} × ${r.quantity} @ ${formatCurrency(r.unitPrice)} = ${formatCurrency(r.unitPrice * r.quantity)}`).join('\n');

        // Stage the sale — do NOT write to DB until merchant confirms
        await WhatsAppAuthService.setPendingConfirmation(phoneNumber, {
            type: 'RECORD_SALE',
            tenant_id: binding.tenant_id,
            resolved,
            totalAmount,
            customer_name: entities.customer_name || 'Walk-in Customer'
        });

        return WhatsAppService.sendButtons(
            phoneNumber,
            `🛒 *Confirm Sale?*\n\n${lineItems}\n\n*Total: ${formatCurrency(totalAmount)}*\nCustomer: ${entities.customer_name || 'Walk-in Customer'}`,
            ['YES — Record It', 'NO — Cancel']
        );
    }

    private static async commitSale(phoneNumber: string, binding: WhatsAppBinding, pending: PendingAction, supabase?: SupabaseClient) {
        const { resolved, totalAmount, customer_name } = pending;

        if (!resolved || totalAmount === undefined) {
            return WhatsAppService.sendText(phoneNumber, "❌ Staged sale data corrupted. Please try again.");
        }

        // FIX 10: Pass channel: 'whatsapp' so analytics correctly attribute this transaction
        const order = await OrderService.createOrder({
            tenant_id: binding.tenant_id,
            total_amount: totalAmount,
            status: 'paid',
            channel: 'whatsapp',
            customer_name,
            customer_email: '',
            items: (pending.resolved as ResolveProduct[]).map((r) => ({
                id: r.product.id,
                name: r.product.name,
                price: r.unitPrice,
                quantity: r.quantity
            }))
        }, supabase);

        if (!order) {
            return WhatsAppService.sendText(phoneNumber, "❌ Sale failed to record. Please try again.");
        }

        const response = `✅ *Sale Recorded*\n\nTotal: ${formatCurrency(totalAmount)}\nCustomer: ${customer_name}\nRef: #${order.id.slice(0, 8).toUpperCase()}\n\n_Inventory updated automatically._`;
        await WhatsAppService.sendText(phoneNumber, response);
        await this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'RECORD_SALE', response);

        // FIX 11: Generate and send actual receipt link
        const receipt = await ReceiptService.generateReceipt(order.id, binding.tenant_id);
        if (receipt) {
            const receiptLink = `${process.env.NEXT_PUBLIC_APP_URL}/receipt/${receipt.id}`;
            await WhatsAppService.sendText(phoneNumber, `📄 Receipt: ${receiptLink}`);
        }

        return this.triggerRestockAlerts(binding.tenant_id, phoneNumber);
    }

    // ─── Expense ────────────────────────────────────────────────────────────────
    private static async handleRecordExpense(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const { amount, category, description } = entities;

        if (!amount) {
            return WhatsAppService.sendText(phoneNumber, "How much was the expense?");
        }

        const validation = IntentValidator.validateExpense(entities);
        if (!validation.valid) {
            return WhatsAppService.sendText(phoneNumber, `⚠️ ${validation.error}`);
        }

        await WhatsAppAuthService.setPendingConfirmation(phoneNumber, {
            type: 'RECORD_EXPENSE',
            tenant_id: binding.tenant_id,
            amount,
            category: category || 'General',
            description: description || `${category || 'General'} expense`
        });

        return WhatsAppService.sendButtons(
            phoneNumber,
            `💸 *Confirm Expense?*\n\nAmount: ${formatCurrency(Number(amount))}\nCategory: ${category || 'General'}\n${description ? `Note: ${description}` : ''}`,
            ['YES — Record It', 'NO — Cancel']
        );
    }

    private static async commitExpense(phoneNumber: string, binding: WhatsAppBinding, pending: PendingAction, supabase?: SupabaseClient) {
        const { amount, category, description } = pending;

        if (amount === undefined) return;

        const success = await LedgerService.recordTransaction({
            tenant_id: binding.tenant_id,
            amount,
            type: 'expense',
            status: 'completed',
            provider: 'WhatsApp',
            description: description || `Expense: ${category}`
        }, supabase);

        const response = success
            ? `✅ *Expense Recorded*\n\nAmount: ${formatCurrency(Number(amount))}\nCategory: ${category}`
            : `❌ Failed to record expense. Please try again.`;

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'RECORD_EXPENSE', response);
    }

    // ─── FIX 11: Actual receipt sending ─────────────────────────────────────────
    private static async handleSendReceipt(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const { customer_phone, order_id } = entities;

        if (!customer_phone) {
            return WhatsAppService.sendText(phoneNumber, "What is the customer's phone number to send the receipt to?");
        }

        // Find the most recent order for this tenant if no order_id specified
        let targetOrderId = order_id;
        if (!targetOrderId) {
            const orders = await OrderService.getOrders(binding.tenant_id);
            const latest = orders[0]; // Already sorted desc by created_at
            if (!latest) {
                return WhatsAppService.sendText(phoneNumber, "No orders found to generate a receipt for.");
            }
            targetOrderId = latest.id;
        }

        const receipt = await ReceiptService.generateReceipt(targetOrderId, binding.tenant_id);
        if (!receipt) {
            return WhatsAppService.sendText(phoneNumber, "❌ Could not generate receipt. Please try again.");
        }

        const receiptLink = `${process.env.NEXT_PUBLIC_APP_URL}/receipt/${receipt.id}`;

        // Send receipt link to the customer's phone via WhatsApp
        await WhatsAppService.sendText(
            customer_phone,
            `🧾 *Receipt from SOLO Merchant*\n\nHere is your digital receipt:\n${receiptLink}\n\n_Powered by SOLO SME_`
        );

        const response = `✅ Receipt sent to ${customer_phone}\n\n📄 Link: ${receiptLink}`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'SEND_RECEIPT', response);
    }

    // ─── FIX 5: VOID_SALE handler ────────────────────────────────────────────────
    private static async handleVoidSale(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const orders = await OrderService.getOrders(binding.tenant_id);
        const latest = orders[0];

        if (!latest) {
            return WhatsAppService.sendText(phoneNumber, "No recent orders found to void.");
        }

        const targetId = entities.order_id || latest.id;
        const target = orders.find(o => o.id === targetId) || latest;

        await WhatsAppAuthService.setPendingConfirmation(phoneNumber, {
            type: 'VOID_SALE',
            tenant_id: binding.tenant_id,
            order_id: target.id,
            order_ref: target.id.slice(0, 8).toUpperCase(),
            amount: target.total_amount,
            // Store items so commitVoid can restore inventory per line item
            resolved: (target.items || []).map((item): ResolveVoidItem => ({
                product_id: item.id || '',
                product: { id: item.id || '', name: item.name || '' },
                quantity: Number(item.quantity) || 1
            }))
        });

        return WhatsAppService.sendButtons(
            phoneNumber,
            `⚠️ *Void Sale?*\n\nOrder: #${target.id.slice(0, 8).toUpperCase()}\nAmount: ${formatCurrency(target.total_amount)}\nCustomer: ${target.customer_name}\n\nThis will reverse inventory and ledger entries.`,
            ['YES — Void It', 'NO — Keep It']
        );
    }

    private static async commitVoid(phoneNumber: string, binding: WhatsAppBinding, pending: PendingAction, supabase?: SupabaseClient) {
        const { order_id, order_ref, amount, resolved } = pending;
        const client = await this.getClient(supabase);

        // 1. Mark order as cancelled
        const { error } = await client
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', order_id)
            .eq('tenant_id', binding.tenant_id);

        if (error) {
            return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'VOID_SALE',
                '❌ Could not void the sale.', false, undefined, supabase)
                .then(() => WhatsAppService.sendText(phoneNumber, "❌ Could not void the sale. Please try from the dashboard."));
        }

        // 2. Reverse inventory: restore stock for each item in the voided order
        // `resolved` is stored in pending from handleVoidSale → populated from order items
        if (resolved && Array.isArray(resolved)) {
            for (const item of (resolved as ResolveVoidItem[])) {
                await InventoryService.recordMovement(binding.tenant_id, {
                    product_id: item.product_id,
                    delta: Math.abs(item.quantity || 1), // positive delta = stock returned
                    type: 'return',
                    channel: 'whatsapp',
                    reference_id: order_id,
                    notes: `Stock restored — order #${order_ref} voided via WhatsApp`
                });
            }
        }

        // 3. Reverse the ledger revenue entry
        await LedgerService.recordTransaction({
            tenant_id: binding.tenant_id,
            order_id,
            amount: -Math.abs(amount || 0), // negative amount = reversal
            type: 'revenue',
            status: 'completed',
            provider: 'WhatsApp',
            description: `REVERSAL — Order #${order_ref} voided via WhatsApp`
        });

        const response = `🔄 *Sale Voided*\n\nOrder #${order_ref} has been cancelled.\nAmount: ${formatCurrency(Number(amount))} reversed.\n\n_Inventory and ledger updated._`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'VOID_SALE', response);
    }

    // ─── FIX 6: RECORD_DEBT handler ──────────────────────────────────────────────
    private static async handleRecordDebt(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const { customer_name, amount, description } = entities;

        if (!customer_name || !amount) {
            return WhatsAppService.sendText(
                phoneNumber,
                "To record a debt, I need the customer name and amount.\n\nExample: _\"Malam Bello took goods worth 5000 on credit\"_"
            );
        }

        // Record as a pending revenue entry in the ledger with 'credit' status
        const success = await LedgerService.recordTransaction({
            tenant_id: binding.tenant_id,
            amount,
            type: 'revenue',
            status: 'pending',
            provider: 'Credit',
            description: `DEBT — ${customer_name}: ${description || 'Goods on credit'}`
        }, supabase);

        if (!success) {
            return WhatsAppService.sendText(phoneNumber, "❌ Failed to record debt. Please try again.");
        }

        const response = `📝 *Debt Recorded*\n\nCustomer: ${customer_name}\nAmount Owed: ${formatCurrency(Number(amount))}\nNote: ${description || 'Goods on credit'}\n\n_Shows in your financials as pending revenue._`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'RECORD_DEBT', response);
    }

    // ─── FIX 7: CHECK_DEBTS handler ──────────────────────────────────────────────
    private static async handleCheckDebts(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const client = await this.getClient(supabase);
        const { data: debts } = await client
            .from('ledger_transactions')
            .select('description, amount, created_at')
            .eq('tenant_id', binding.tenant_id)
            .eq('type', 'revenue')
            .eq('status', 'pending')
            .ilike('description', 'DEBT%')
            .order('created_at', { ascending: false })
            .limit(10);

        if (!debts || debts.length === 0) {
            return WhatsAppService.sendText(phoneNumber, "✅ No outstanding debts recorded. You're all clear!");
        }

        const customerFilter = entities.customer_name?.toLowerCase();
        const filtered = customerFilter
            ? debts.filter((d: { description: string }) => d.description.toLowerCase().includes(customerFilter))
            : debts;

        const totalOwed = filtered.reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);
        const list = filtered.map((d: { description: string; amount: number; created_at: string }) =>
            `• ${d.description.replace('DEBT — ', '')} — ${formatCurrency(Number(d.amount))}`
        ).join('\n');

        const response = `💰 *Outstanding Debts*\n\n${list}\n\n*Total Owed: ${formatCurrency(totalOwed)}*`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'CHECK_DEBTS', response);
    }

    // ─── FIX 8: UPDATE_STOCK handler ─────────────────────────────────────────────
    private static async handleUpdateStock(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const { product: productName, quantity, action } = entities;

        if (!productName || !quantity) {
            return WhatsAppService.sendText(
                phoneNumber,
                "To update stock, tell me the product, quantity, and direction.\n\nExample: _\"Add 20 bags of rice to stock\"_"
            );
        }

        const products = await ProductService.getProducts(binding.tenant_id, supabase);
        const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));

        if (!product) {
            return WhatsAppService.sendText(phoneNumber, `I couldn't find "*${productName}*" in your product list.`);
        }

        const delta = action === 'REMOVE' ? -Math.abs(quantity) : Math.abs(quantity);

        await InventoryService.recordMovement(binding.tenant_id, {
            product_id: product.id,
            delta,
            type: action === 'REMOVE' ? 'adjustment' : 'restock',
            channel: 'whatsapp',
            reference_id: product.id,
            notes: `WhatsApp stock ${action === 'REMOVE' ? 'reduction' : 'addition'} — ${quantity} units`
        });

        const newStock = (product.stock_quantity || 0) + delta;
        const response = `📦 *Stock Updated*\n\n${product.name}\n${action === 'REMOVE' ? `Removed: ${quantity}` : `Added: ${quantity}`}\nNew Stock: ${newStock} units`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'UPDATE_STOCK', response);
    }

    /**
     * FIX: Warm, branded greeting.
     */
    private static async handleGreeting(phoneNumber: string, binding: WhatsAppBinding | null, result: IntentResult, supabase?: SupabaseClient) {
        const name = binding?.tenant_name || 'Business Owner';
        const greeting = result.response_text || `Hello ${name}! 👋 I'm Amina, your SOLO Assistant. How's market today?`;
        
        await WhatsAppService.sendText(phoneNumber, greeting);
        
        // Follow up with a menu if they are just starting
        if (!binding) {
            return WhatsAppService.sendText(phoneNumber, "Type *MENU* to see how I can help you set up your store today! 🚀");
        }
    }

    // ─── FIX 9: Interactive MENU handler ─────────────────────────────────────────
    private static async handleMenu(phoneNumber: string) {
        const bodyText = "Hello! 👋 I'm your *SOLO Assistant*. I can help you manage your business right here on WhatsApp.\n\nSelect an option below to get started:";
        
        const sections = [
            {
                title: "💰 Sales & Finance",
                rows: [
                    { id: "menu_sale", title: "Record a Sale", description: "Log a new product sale" },
                    { id: "menu_report", title: "Business Report", description: "See how you did today/this week" },
                    { id: "menu_expense", title: "Record Expense", description: "Log business costs" },
                    { id: "menu_debts", title: "Check Debts", description: "Who owes me money?" }
                ]
            },
            {
                title: "📦 Inventory & Growth",
                rows: [
                    { id: "menu_stock", title: "Check Stock", description: "Check product availability" },
                    { id: "menu_add_stock", title: "Update Stock", description: "Add new inventory" },
                    { id: "menu_advice", title: "Get AI Advice", description: "Strategic growth tips" }
                ]
            },
            {
                title: "📢 Marketing & Customers",
                rows: [
                    { id: "menu_promo", title: "Send Promo", description: "Broadcast to customers" },
                    { id: "menu_add_customer", title: "Add Customer", description: "Register a new buyer" }
                ]
            }
        ];

        return WhatsAppService.sendList(
            phoneNumber,
            bodyText,
            "View Commands",
            sections
        );
    }

    // ─── Promo ──────────────────────────────────────────────────────────────────
    private static async handleSendPromo(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const { segment, message } = entities;

        if (!segment) {
            return WhatsAppService.sendButtons(
                phoneNumber,
                "Which customer segment would you like to target?",
                ['VIP', 'Dormant', 'All Customers']
            );
        }

        const stats = await SegmentationService.getSegmentStats(binding.tenant_id, supabase);
        const target = stats.find(s => s.segment.toLowerCase() === segment.toLowerCase());

        if (!target || target.count === 0) {
            return WhatsAppService.sendText(phoneNumber, `No customers found in the "${segment}" segment.`);
        }

        await WhatsAppAuthService.setPendingConfirmation(phoneNumber, {
            type: 'SEND_PROMO',
            tenant_id: binding.tenant_id,
            segment: target.segment,
            count: target.count,
            message: message || undefined
        });

        return WhatsAppService.sendButtons(
            phoneNumber,
            `📢 *Confirm Broadcast?*\n\nSegment: ${target.segment}\nRecipients: ${target.count} customers\n\nMeta messaging charges apply. Confirm to send.`,
            ['YES — Send Now', 'NO — Cancel']
        );
    }

    private static async commitPromo(phoneNumber: string, binding: WhatsAppBinding, pending: PendingAction, supabase?: SupabaseClient) {
        const customers = await CustomerService.getCustomers(binding.tenant_id, supabase);
        const now = new Date();

        const isPhoneLike = (val: string) => /^\d{7,15}$/.test(val.replace(/[\s+\-()+]/g, ''));

        const segmentedPhones = customers
            .filter(c => {
                const lastDate = c.last_order_at ? new Date(c.last_order_at) : new Date(c.created_at);
                const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                if (pending.segment === 'VIP') return c.total_spend > 100000;
                if (pending.segment === 'Dormant') return daysSince > 30;
                return true; // 'All Customers'
            })
            .map(c => {
                // Priority: whatsapp_phone (dedicated) → phone → email (only if phone-like)
                const raw = c.whatsapp_phone || c.phone ||
                    (c.email && isPhoneLike(c.email) ? c.email : null);
                return raw ? normalisePhone(raw.replace(/[\s+\-()]/g, '')) : null;
            })
            .filter((p): p is string => !!p);

        if (segmentedPhones.length === 0) {
            const response = `⚠️ No customers in the "${pending.segment}" segment have a WhatsApp phone number on file.\n\n_Add phone numbers to customer profiles via the dashboard to enable WhatsApp broadcasts._`;
            await WhatsAppService.sendText(phoneNumber, response);
            return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'SEND_PROMO', response, false, 'No valid phone numbers in segment');
        }

        const promoMessage = pending.message
            || `Hello! ${binding.tenant_name} has a special offer for you today. Reply to learn more! 🎉`;

        let sent = 0, failed = 0;
        for (const recipientPhone of segmentedPhones) {
            try {
                await WhatsAppService.sendText(
                    recipientPhone,
                    `📢 *Message from ${binding.tenant_name}*\n\n${promoMessage}\n\n_Reply STOP to opt out._`
                );
                sent++;
                await new Promise(r => setTimeout(r, 15)); // 15ms gap — safe under Meta 80msg/s limit
            } catch {
                failed++;
            }
        }

        const response = `✅ *Broadcast Complete*\n\nSegment: ${pending.segment}\nSent: ${sent} messages${failed > 0 ? `\nFailed: ${failed}` : ''}\n\n_Full delivery stats in your dashboard._`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'SEND_PROMO', response, sent > 0);
    }

    // ─── Balance & Reports ──────────────────────────────────────────────────────
    private static async handleCheckBalance(phoneNumber: string, binding: WhatsAppBinding, supabase?: SupabaseClient) {
        const summary = await LedgerService.getSummary(binding.tenant_id);
        const response = `📊 *Financial Status*\n\nAvailable Balance: ${formatCurrency(summary.availableBalance)}\nTotal Revenue: ${formatCurrency(summary.totalRevenue)}\nPending Payouts: ${formatCurrency(summary.pendingPayouts)}`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'CHECK_BALANCE', response);
    }

    private static async handleRevenueSummary(phoneNumber: string, binding: WhatsAppBinding, supabase?: SupabaseClient) {
        const summary = await LedgerService.getFinancialSummary(binding.tenant_id);
        const response = `📈 *Revenue Summary*\n\nNet Revenue: ${formatCurrency(summary.totalRevenue)}\nTotal Expenses: ${formatCurrency(summary.totalExpenses)}\nNet Balance: ${formatCurrency(summary.netBalance)}`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'GET_REVENUE_SUMMARY', response);
    }

    private static async handleBusinessReport(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const period = entities.period || 'TODAY';
        await WhatsAppService.sendText(phoneNumber, `📊 Generating your *${period} Report*...`);

        const [summary, stats] = await Promise.all([
            LedgerService.getFinancialSummary(binding.tenant_id, supabase),
            AnalyticsService.getDashboardStats(binding.tenant_id, '7d', undefined, supabase)
        ]);

        // Calculate stock health as % of products NOT on low-stock alert
        // (alerts are product-level; orderCount is transaction-level — these are unrelated)
        const totalProducts = (stats.topProducts?.length || 0) + stats.stockAlerts.length;
        const inStockRate = totalProducts > 0
            ? Math.round(((totalProducts - stats.stockAlerts.length) / totalProducts) * 100)
            : 100;

        const response =
            `📈 *SOLO Report: ${period}*\n\n` +
            `💰 *Financials*\nRevenue: ${formatCurrency(summary.totalRevenue)}\nExpenses: ${formatCurrency(summary.totalExpenses)}\nNet: ${formatCurrency(summary.netBalance)}\n\n` +
            `📦 *Operations*\nSales: ${stats.orderCount}\nStock Health: ${inStockRate}% in stock\n\n` +
            `🏆 *Top Product*: ${stats.topProducts?.[0]?.name || 'N/A'}\n\n` +
            `_Reply "ADVICE" for growth recommendations._`;

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'GET_REPORT', response);
    }

    // ─── AI Advice ──────────────────────────────────────────────────────────────
    private static async handleAIAdvice(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        await WhatsAppService.sendText(phoneNumber, "🔍 Analysing your business data... one moment.");

        // Fetch in parallel for speed
        // AIAnalyticsService requires FinanceService.FinancialSummary (P&L shape)
        // Report display uses LedgerService summary (simpler totalRevenue/totalExpenses shape)
        const [stats, financeSummaryForAI, health] = await Promise.all([
            AnalyticsService.getDashboardStats(binding.tenant_id, '7d', undefined, supabase),
            FinanceService.getFinancialSummary(binding.tenant_id, supabase),
            InsightsService.getBusinessHealth(binding.tenant_id, supabase)
        ]);
        const insights = await AIAnalyticsService.getBusinessInsights(stats, financeSummaryForAI);

        let response = `💡 *Strategic Advisor Brief*\nTheme: ${entities.topic || 'General Growth'}\n\n`;
        insights.forEach((insight: { title: string; description: string }, i: number) => {
            response += `${i + 1}. *${insight.title}*\n${insight.description}\n\n`;
        });

        if (health.recommendations?.length > 0) {
            response += `⚡ *Quick Win*: ${health.recommendations[0]}`;
        }

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'AI_ADVICE', response);
    }

    // ─── Inventory ──────────────────────────────────────────────────────────────
    private static async handleCheckInventory(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const { product: productName } = entities;
        const products = await ProductService.getProducts(binding.tenant_id, supabase);

        if (productName) {
            const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
            if (product) {
                // FIX R: Use product's own reorder_point/low_stock_threshold if set, else fallback to 5
                const threshold = (product as WhatsAppEntities).reorder_point ?? (product as WhatsAppEntities).low_stock_threshold ?? 5;
                const stockStatus = (product.stock_quantity || 0) <= threshold ? '⚠️ LOW STOCK' : '✅ In Stock';
                const response = `📦 *${product.name}*\n\nStock: ${product.stock_quantity} units ${stockStatus}\nPrice: ${formatCurrency(product.price)}`;
                await WhatsAppService.sendText(phoneNumber, response);
                return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'CHECK_INVENTORY', response);
            }
            return WhatsAppService.sendText(phoneNumber, `I couldn't find "*${productName}*" in your product list.`);
        }

        // FIX R: Use per-product threshold for low stock detection across overview
        const lowStock = products.filter(p => {
            const threshold = (p as WhatsAppEntities).reorder_point ?? (p as WhatsAppEntities).low_stock_threshold ?? 5;
            return (p.stock_quantity || 0) <= threshold;
        }).slice(0, 5);

        let response = `📦 *Inventory Overview*\n\nTotal Products: ${products.length}`;
        if (lowStock.length > 0) {
            response += `\n\n⚠️ *Low Stock Alert:*\n${lowStock.map(p => `• ${p.name}: ${p.stock_quantity} units`).join('\n')}`;
        } else {
            response += '\n\n✅ All items are well stocked.';
        }

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'CHECK_INVENTORY', response);
    }

    // ─── Customers & Loyalty ─────────────────────────────────────────────────────
    private static async handleAddCustomer(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const { name, phone, email } = entities;

        if (!name) {
            return WhatsAppService.sendText(phoneNumber, "What is the customer's full name?");
        }

        // FIX Q: Store phone in email field when no email is given (CustomerService schema uses email as contact identifier).
        // This allows CHECK_LOYALTY and promo broadcasts to reach the customer via WhatsApp.
        const contactIdentifier = email || phone || '';

        const customer = await CustomerService.createCustomer(binding.tenant_id, {
            full_name: name,
            email: contactIdentifier
        }, supabase);

        if (!customer) {
            return WhatsAppService.sendText(phoneNumber, "❌ Error creating customer profile. Please try again.");
        }

        const response = `👤 *Customer Registered*\n\nName: ${customer.full_name}\nID: ${customer.id.slice(0, 8).toUpperCase()}\n\n_You can now track sales and loyalty for this customer._`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'ADD_CUSTOMER', response);
    }

    private static async handleCheckLoyalty(phoneNumber: string, binding: WhatsAppBinding, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const { customer_name, customer_phone } = entities;

        const customers = await CustomerService.getCustomers(binding.tenant_id, supabase);
        const customer = customers.find(c =>
            (customer_name && c.full_name.toLowerCase().includes(customer_name.toLowerCase())) ||
            (customer_phone && c.email === customer_phone)
        );

        if (!customer) {
            return WhatsAppService.sendText(phoneNumber, "I couldn't find a matching customer.");
        }

        const loyalty = await LoyaltyService.getAccount(customer.id);
        const discountValue = LoyaltyService.getDiscountValue(loyalty.points);
        const response = `🏅 *Loyalty: ${customer.full_name}*\n\nTier: ${loyalty.tier}\nPoints: ${loyalty.points}\nRedeemable: ${formatCurrency(discountValue)}`;

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'CHECK_LOYALTY', response);
    }

    // ─── Account Linking ─────────────────────────────────────────────────────────
    private static async handleLinkAccount(phoneNumber: string, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const { code, email } = entities;

        if (!code && !email) {
            return WhatsAppService.sendText(
                phoneNumber,
                "To link your SOLO account, reply with your *link code* or your *registered email address*.\n\nYou can find your link code in the SOLO dashboard under Settings → WhatsApp."
            );
        }

        // Resolve tenant from link code or email
        const client = await this.getClient(supabase);
        let tenantId: string | null = null;

        if (code) {
            // Link codes are stored as whatsapp_link_code on the tenant record
            const clientToUse = await this.getClient(supabase);
            const { data } = await clientToUse
                .from('tenants')
                .select('id')
                .eq('whatsapp_link_code', code.toUpperCase().trim())
                .single();
            tenantId = data?.id || null;
        } else if (email) {
            // Look up the tenant via the owner profile email.
            // profiles.email is populated by the 20260309_whatsapp_onboarding migration.
            // If not yet backfilled, falls back to staff_members table.
            const clientToUse = await this.getClient(supabase);
            const { data: profileMatch } = await clientToUse
                .from('profiles')
                .select('tenant_id')
                .eq('email', email.toLowerCase().trim())
                .single();

            if (profileMatch?.tenant_id) {
                tenantId = profileMatch.tenant_id;
            } else {
                // Fallback: check staff_members (covers cases where profiles.email not yet synced)
                const { data: staffMatch } = await clientToUse
                    .from('staff_members')
                    .select('tenant_id')
                    .eq('email', email.toLowerCase().trim())
                    .single();
                tenantId = staffMatch?.tenant_id || null;
            }
        }

        if (!tenantId) {
            return WhatsAppService.sendText(
                phoneNumber,
                "❌ I couldn't find a SOLO account with that code or email.\n\nDouble-check and try again, or visit your dashboard under *Settings → WhatsApp* to get your link code."
            );
        }

        // Generate OTP and send it via WhatsApp
        const otp = await WhatsAppAuthService.initiateBinding(phoneNumber, tenantId);

        return WhatsAppService.sendText(
            phoneNumber,
            `🔐 *Your SOLO Verification Code*\n\n*${otp}*\n\nReply with this 6-digit code to complete linking.\n_Expires in 10 minutes._`
        );
    }

    // Handles OTP verification replies (e.g. "123456")
    private static async handleVerifyOtp(phoneNumber: string, entities: WhatsAppEntities, supabase?: SupabaseClient) {
        const { otp } = entities;

        if (!otp) {
            return WhatsAppService.sendText(phoneNumber, "Please reply with your 6-digit verification code.");
        }

        const result = await WhatsAppAuthService.verifyAndBind(phoneNumber, otp, supabase);

        if (result.success) {
            return WhatsAppService.sendText(
                phoneNumber,
                "✅ *Account Linked Successfully!*\n\nYour SOLO account is now connected to this WhatsApp number.\n\nType *MENU* to see everything you can do. 🚀"
            );
        }

        const messages: Record<string, string> = {
            INVALID_OTP: "❌ Wrong code. Please check and try again.",
            MAX_ATTEMPTS_EXCEEDED: "🔒 Too many wrong attempts. Please request a new code by sending your link code again.",
            OTP_EXPIRED: "⏰ Code expired. Please send your link code again to get a fresh one.",
            SYSTEM_ERROR: "❌ Something went wrong. Please try again in a moment."
        };

        return WhatsAppService.sendText(
            phoneNumber,
            messages[result.reason || ''] || "❌ Verification failed. Please try again."
        );
    }

    // ─── Proactive Intelligence ──────────────────────────────────────────────────
    public static async triggerRestockAlerts(tenantId: string, phoneNumber: string, supabase?: SupabaseClient) {
        const stats = await AnalyticsService.getDashboardStats(tenantId, '7d', undefined, supabase);
        const lowStockItems = stats.stockAlerts;
        if (lowStockItems.length === 0) return;

        const itemsList = lowStockItems
            .map((item) => `• ${item.productName} (${item.currentStock} left)`)
            .join('\n');
        const response = `⚠️ *Low Stock Alert*\n\n${itemsList}\n\n_Reply "ADVICE" for restock recommendations based on sales velocity._`;

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(tenantId, phoneNumber, 'outbound', 'SYSTEM_ALERT', response, true, undefined, supabase);
    }

    // ─── Internal Logging ────────────────────────────────────────────────────────
    private static async logMessage(
        tenantId: string,
        phoneNumber: string,
        direction: 'inbound' | 'outbound',
        intent: string,
        content: string,
        success: boolean = true,
        errorMessage?: string,
        supabase?: SupabaseClient
    ) {
        try {
            const client = await this.getClient(supabase);
            return client
                .from('whatsapp_message_log')
                .insert({
                    tenant_id: tenantId,
                    phone_number: phoneNumber,
                    direction,
                    intent,
                    message_preview: content.substring(0, 100),
                    success,
                    ...(errorMessage ? { error_message: errorMessage } : {})
                });
        } catch (err) {
            console.error('[WhatsAppCommand] Error logging message:', err);
        }
    }
}
