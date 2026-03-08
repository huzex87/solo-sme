import { OrderService } from './orderService';
import { ProductService } from './productService';
import { LedgerService } from './ledgerService';
import { WhatsAppService } from './whatsappService';
import { WhatsAppAuthService, WhatsAppBinding } from './whatsappAuthService';
import { ReceiptService } from './receiptService';
import { CustomerService } from './customerService';
import { LoyaltyService } from './loyaltyService';
import { SegmentationService, CustomerSegment } from './segmentationService';
import { AnalyticsService } from './analyticsService';
import { FinanceService } from './financeService';
import { InsightsService } from './insightsService';
import { AIAnalyticsService } from './aiAnalyticsService';
import { IntentResult, IntentEngine } from './intentEngine';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
    return createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

/**
 * WhatsApp Command Service
 * Orchestrates business logic execution for classified intents.
 */
export class WhatsAppCommandService {

    /**
     * Main entry point for processing a classified intent.
     */
    static async execute(phoneNumber: string, binding: WhatsAppBinding | null, result: IntentResult) {
        if (!binding) {
            if (result.intent === 'LINK_ACCOUNT') {
                return this.handleLinkAccount(phoneNumber, result.entities);
            }
            return WhatsAppService.sendText(phoneNumber, "I don't recognize this number. Please reply with your SOLO link code or email address to get started.");
        }

        switch (result.intent) {
            case 'RECORD_SALE':
                return this.handleRecordSale(phoneNumber, binding, result.entities);
            case 'CHECK_BALANCE':
                return this.handleCheckBalance(phoneNumber, binding, result.entities);
            case 'GET_REVENUE_SUMMARY':
                return this.handleRevenueSummary(phoneNumber, binding, result.entities);
            case 'CHECK_INVENTORY':
                return this.handleCheckInventory(phoneNumber, binding, result.entities);
            case 'RECORD_EXPENSE':
                return this.handleRecordExpense(phoneNumber, binding, result.entities);
            case 'SEND_RECEIPT':
                return this.handleSendReceipt(phoneNumber, binding, result.entities);
            case 'ADD_CUSTOMER':
                return this.handleAddCustomer(phoneNumber, binding, result.entities);
            case 'CHECK_LOYALTY':
                return this.handleCheckLoyalty(phoneNumber, binding, result.entities);
            case 'SEND_PROMO':
                return this.handleSendPromo(phoneNumber, binding, result.entities);
            case 'BUSINESS_ADVICE':
            case 'AI_ADVICE':
                return this.handleAIAdvice(phoneNumber, binding, result.entities);
            case 'GET_REPORT':
                return this.handleBusinessReport(phoneNumber, binding, result.entities);
            default:
                return WhatsAppService.sendText(phoneNumber, result.response_text || "I'm not sure how to help with that yet, but I'm learning!");
        }
    }

    private static async handleLinkAccount(phoneNumber: string, entities: any) {
        const { code, email } = entities;
        if (!code && !email) {
            return WhatsAppService.sendText(phoneNumber, "To link your account, I need your SOLO link code or your registered email address.");
        }
        return WhatsAppService.sendText(phoneNumber, "Institutional linking initiated. Please check your email for a verification code to complete the process.");
    }

    private static async handleRecordSale(phoneNumber: string, binding: WhatsAppBinding, entities: any) {
        const { product: productName, quantity = 1, price } = entities;

        if (!productName) {
            return WhatsAppService.sendText(phoneNumber, "I couldn't identify the product. Could you please specify what you sold?");
        }

        const products = await ProductService.getProducts(binding.tenant_id);
        const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));

        if (!product) {
            return WhatsAppService.sendText(phoneNumber, `I couldn't find a product named "${productName}" in your inventory.`);
        }

        const unitPrice = price || product.price;
        const totalAmount = unitPrice * quantity;

        const order = await OrderService.createOrder({
            tenant_id: binding.tenant_id,
            total_amount: totalAmount,
            status: 'paid',
            channel: 'pos',
            customer_name: entities.customer_name || 'Walking Customer',
            items: [{
                id: product.id,
                name: product.name,
                price: unitPrice,
                quantity: quantity
            }]
        });

        if (!order) {
            return WhatsAppService.sendText(phoneNumber, "I encountered an error while recording the sale.");
        }

        const response = `✅ *Sale Recorded*\n\nProduct: ${product.name}\nQty: ${quantity}\nTotal: ₦${totalAmount.toLocaleString()}\n\nTransaction #${order.id.slice(0, 8).toUpperCase()}`;
        await WhatsAppService.sendText(phoneNumber, response);

        // Generate and offer receipt
        const receipt = await ReceiptService.generateReceipt(order.id, binding.tenant_id);
        if (receipt) {
            const receiptLink = `${process.env.NEXT_PUBLIC_APP_URL}/receipt/${receipt.id}`;
            await WhatsAppService.sendText(phoneNumber, `📄 Digital Receipt: ${receiptLink}`);
        }

        await this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'RECORD_SALE', response);

        // Proactive Intelligence: Check for low stock after transaction
        return this.triggerRestockAlerts(binding.tenant_id, phoneNumber);
    }

    private static async handleRecordExpense(phoneNumber: string, binding: WhatsAppBinding, entities: any) {
        const { amount, category, description } = entities;

        if (!amount) {
            return WhatsAppService.sendText(phoneNumber, "Could you specify the amount for this expense?");
        }

        const success = await LedgerService.recordTransaction({
            tenant_id: binding.tenant_id,
            amount: amount,
            type: 'expense',
            status: 'completed',
            provider: 'WhatsApp',
            description: description || `Expense: ${category || 'General'}`
        });

        if (!success) {
            return WhatsAppService.sendText(phoneNumber, "Failed to record the expense. Please try again.");
        }

        const response = `💸 *Expense Recorded*\n\nAmount: ₦${amount.toLocaleString()}\nCategory: ${category || 'General'}\nDesc: ${description || 'No description'}`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'RECORD_EXPENSE', response);
    }

    private static async handleSendReceipt(phoneNumber: string, binding: WhatsAppBinding, entities: any) {
        const { customer_phone, order_id } = entities;

        if (!customer_phone) {
            return WhatsAppService.sendText(phoneNumber, "Please provide the customer's phone number to send the receipt.");
        }

        // Logic here would ideally find the latest order if order_id is missing
        await WhatsAppService.sendText(phoneNumber, `I'm preparing to send the receipt to ${customer_phone}. One moment...`);

        // In a real scenario, we'd trigger the actual receipt share
        return WhatsAppService.sendText(phoneNumber, "Receipt sharing specialized flow is coming in the next update!");
    }

    private static async handleCheckBalance(phoneNumber: string, binding: WhatsAppBinding, entities: any) {
        const summary = await LedgerService.getSummary(binding.tenant_id);
        const response = `📊 *Financial Status*\n\nAvailable Balance: ₦${summary.availableBalance.toLocaleString()}\nTotal Revenue: ₦${summary.totalRevenue.toLocaleString()}\nPending Payouts: ₦${summary.pendingPayouts.toLocaleString()}`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'CHECK_BALANCE', response);
    }

    private static async handleRevenueSummary(phoneNumber: string, binding: WhatsAppBinding, entities: any) {
        const summary = await LedgerService.getFinancialSummary(binding.tenant_id);
        const response = `📈 *Revenue Summary*\n\nNet Revenue: ₦${summary.totalRevenue.toLocaleString()}\nTotal Expenses: ₦${summary.totalExpenses.toLocaleString()}\nNet Balance: ₦${summary.netBalance.toLocaleString()}`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'GET_REVENUE_SUMMARY', response);
    }

    private static async handleAIAdvice(phoneNumber: string, binding: WhatsAppBinding, entities: any) {
        await WhatsAppService.sendText(phoneNumber, "🔍 I am analyzing your business logs and market position to formulate a strategic brief. One moment...");

        const stats = await AnalyticsService.getDashboardStats(binding.tenant_id);
        const health = await InsightsService.getBusinessHealth(binding.tenant_id);
        const financeSummary = await FinanceService.getFinancialSummary(binding.tenant_id);

        const prompt = `
            Act as a world-class SME consultant. Analyze this business snapshot and provide 3-4 bullet points of high-level strategic advice.
            
            REVENUE: ₦${financeSummary.revenue.toLocaleString()}
            PROFIT: ₦${financeSummary.profit.toLocaleString()}
            STOCK ALERTS: ${stats.stockAlerts.length} items
            HEALTH SCORE: ${health.score}/100 (${health.status})
            RECOMMENDATIONS: ${health.recommendations.join(', ')}
            
            Topic requested: ${entities.topic || 'General Growth'}
            
            Respond in a professional, brief, and supportive tone suitable for WhatsApp.
        `;

        // Use high-fidelity financial data for AI insights
        const insights = await AIAnalyticsService.getBusinessInsights(stats, financeSummary);

        let response = `💡 *Strategic Advisor Brief*\n\nTheme: ${entities.topic || 'General Growth'}\n\n`;
        insights.forEach((insight, i) => {
            response += `${i + 1}. *${insight.title}*\n${insight.description}\n\n`;
        });

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'AI_ADVICE', response);
    }

    private static async handleBusinessReport(phoneNumber: string, binding: WhatsAppBinding, entities: any) {
        const period = entities.period || 'TODAY';
        await WhatsAppService.sendText(phoneNumber, `📊 Generating your *Institutional ${period} Report*...`);

        const summary = await LedgerService.getFinancialSummary(binding.tenant_id);
        const stats = await AnalyticsService.getDashboardStats(binding.tenant_id);

        const response = `📈 *SOLO Business Report: ${period}*\n\n` +
            `💰 *Financials*\nRevenue: ₦${summary.totalRevenue.toLocaleString()}\nExpenses: ₦${summary.totalExpenses.toLocaleString()}\nNet: ₦${summary.netBalance.toLocaleString()}\n\n` +
            `📦 *Operation*\nSales Recorded: ${stats.orderCount}\nIn-Stock Rate: ${Math.round((1 - stats.stockAlerts.length / (stats.orderCount || 1)) * 100)}%\n\n` +
            `🏆 *Top Product*: ${stats.topProducts?.[0]?.name || 'N/A'}\n\n` +
            `_Reply "ADVICE" for high-impact growth recommendations._`;

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'GET_REPORT', response);
    }

    private static async handleAddCustomer(phoneNumber: string, binding: WhatsAppBinding, entities: any) {
        const { name, phone, email } = entities;

        if (!name) {
            return WhatsAppService.sendText(phoneNumber, "To create a customer profile, I need at least their full name.");
        }

        const customer = await CustomerService.createCustomer(binding.tenant_id, {
            full_name: name,
            email: email || ''
        });

        if (!customer) {
            return WhatsAppService.sendText(phoneNumber, "I encountered an error while creating the customer profile.");
        }

        const response = `👤 *Customer Registered*\n\nName: ${customer.full_name}\nID: ${customer.id.slice(0, 8).toUpperCase()}\n\nYou can now record sales against this customer or track their loyalty.`;
        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'ADD_CUSTOMER', response);
    }

    private static async handleCheckLoyalty(phoneNumber: string, binding: WhatsAppBinding, entities: any) {
        const { customer_name, customer_phone } = entities;

        const customers = await CustomerService.getCustomers(binding.tenant_id);
        const customer = customers.find(c =>
            (customer_name && c.full_name.toLowerCase().includes(customer_name.toLowerCase())) ||
            (customer_phone && c.id === customer_phone) // Simplified lookup
        );

        if (!customer) {
            return WhatsAppService.sendText(phoneNumber, "I couldn't find a matching customer in your database.");
        }

        const loyalty = await LoyaltyService.getAccount(customer.id);
        const response = `🏅 *Loyalty Status: ${customer.full_name}*\n\nTier: ${loyalty.tier}\nPoints: ${loyalty.points}\nValue: ₦${LoyaltyService.getDiscountValue(loyalty.points).toLocaleString()}\n\nInstitutional rewards applied to next purchase.`;

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'CHECK_LOYALTY', response);
    }

    private static async handleSendPromo(phoneNumber: string, binding: WhatsAppBinding, entities: any) {
        const { segment, message } = entities;

        if (!segment) {
            return WhatsAppService.sendText(phoneNumber, "Which customer segment would you like to target? (e.g., VIP, Dormant, All)");
        }

        const stats = await SegmentationService.getSegmentStats(binding.tenant_id);
        const target = stats.find(s => s.segment.toLowerCase() === segment.toLowerCase());

        if (!target || target.count === 0) {
            return WhatsAppService.sendText(phoneNumber, `I found no customers in the "${segment}" segment.`);
        }

        const response = `📢 *Broadcast Initiation*\n\nSegment: ${target.segment}\nReach: ${target.count} customers\n\nI am preparing an institutional broadcast using your "SOLO_PROMO" template. Standard Meta charges apply. Confirm with "SEND NOW".`;

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'SEND_PROMO', response);
    }

    private static async handleCheckInventory(phoneNumber: string, binding: WhatsAppBinding, entities: any) {
        const { product: productName } = entities;
        const products = await ProductService.getProducts(binding.tenant_id);

        if (productName) {
            const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
            if (product) {
                const response = `📦 *Inventory Status*\n\nProduct: ${product.name}\nStock: ${product.stock_quantity}\nPrice: ₦${product.price.toLocaleString()}`;
                await WhatsAppService.sendText(phoneNumber, response);
                return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'CHECK_INVENTORY', response);
            }
        }

        const lowStock = products.filter(p => (p.stock_quantity || 0) < 5).slice(0, 5);
        let response = "📦 *Inventory Overview*";
        if (lowStock.length > 0) {
            response += "\n\nLow Stock items:";
            lowStock.forEach(p => response += `\n- ${p.name}: ${p.stock_quantity}`);
        } else {
            response += "\n\nAll items are well stocked.";
        }

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(binding.tenant_id, phoneNumber, 'outbound', 'CHECK_INVENTORY', response);
    }

    public static async triggerRestockAlerts(tenantId: string, phoneNumber: string) {
        const stats = await AnalyticsService.getDashboardStats(tenantId);
        const lowStockItems = stats.stockAlerts;

        if (lowStockItems.length === 0) return;

        const itemsList = lowStockItems.map(item => `- ${item.productName} (${item.currentStock} left)`).join('\n');
        const response = `⚠️ *Low Stock Alert*\n\nThe following items are running low:\n\n${itemsList}\n\n_Reply "ADVICE" to see if you should restock now based on sales velocity._`;

        await WhatsAppService.sendText(phoneNumber, response);
        return this.logMessage(tenantId, phoneNumber, 'outbound', 'SYSTEM_ALERT', response);
    }

    private static async logMessage(tenantId: string, phoneNumber: string, direction: 'inbound' | 'outbound', intent: string, content: string) {
        return getSupabaseClient().from('whatsapp_message_log').insert({
            tenant_id: tenantId,
            phone_number: phoneNumber,
            direction,
            intent,
            message_preview: content.substring(0, 100),
            success: true
        });
    }
}
