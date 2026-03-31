import { IntentResult } from './intentEngine';
import { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/server';
import { WhatsAppService } from './whatsappService';
import { WhatsAppAuthService, WhatsAppBinding, PendingAction } from './whatsappAuthService';
import { registry, SaleHandler, ExpenseHandler, PromoHandler, VoidHandler } from './whatsapp/handlers';
import { AnalyticsService } from './analyticsService';

/**
 * WhatsApp Command Service (Institutional V4.0)
 * Orchestrates business logic execution via modular handlers.
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
        const client = await this.getClient(supabase);

        if (!binding) {
            if (result.intent === 'LINK_ACCOUNT') {
                return this.handleLinkAccount(phoneNumber, result.entities, client);
            }
            return WhatsAppService.sendText(
                phoneNumber,
                "I don't recognize this number with any SOLO account.\n\nReply with your SOLO link code or registered email to get started. 🔗"
            );
        }

        // 1. Special case handlers that don't follow the standard intent pattern yet
        if (result.intent === 'GREETING') return this.handleGreeting(phoneNumber, binding, result);
        if (result.intent === 'MENU') return this.handleMenu(phoneNumber);
        if (result.intent === 'VERIFY_OTP') return this.handleVerifyOtp(phoneNumber, result.entities, client);
        if (result.intent === 'BUSINESS_ADVICE') result.intent = 'AI_ADVICE'; // normalization

        // 2. Dispatch to modular handlers
        const handler = registry.getHandler(result.intent);
        if (handler) {
            try {
                await handler.handle({ from: phoneNumber, binding, supabase: client }, result);
                
                // Post-execution hooks (e.g., logging)
                await this.logMessage(binding.tenant_id, phoneNumber, 'outbound', result.intent, "Handler executed successfully", true, undefined, client);
                
                // Optional: trigger alerts after certain actions
                if (result.intent === 'RECORD_SALE') {
                    await this.triggerRestockAlerts(binding.tenant_id, phoneNumber, client);
                }
                return;
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                console.error(`[WhatsApp] Handler error for ${result.intent}:`, err);
                await this.logMessage(binding.tenant_id, phoneNumber, 'outbound', result.intent, "Handler failed", false, message, client);
                return WhatsAppService.sendText(phoneNumber, "❌ Something went wrong processing your request. Please try again.");
            }
        }

        // 3. Fallback for unhandled intents
        return WhatsAppService.sendText(
            phoneNumber,
            result.response_text || "I'm not sure how to help with that yet.\n\nType *MENU* to see everything I can do for you. 📋"
        );
    }

    /**
     * Resolves a pending staged action when merchant replies YES or NO.
     */
    static async resolveConfirmation(
        phoneNumber: string,
        binding: WhatsAppBinding,
        pending: PendingAction,
        confirmed: boolean,
        supabase?: SupabaseClient
    ) {
        const client = await this.getClient(supabase);
        await WhatsAppAuthService.clearPendingConfirmation(phoneNumber);

        if (!confirmed) {
            return WhatsAppService.sendText(phoneNumber, "✅ Action cancelled. Nothing was recorded.");
        }

        const context = { from: phoneNumber, binding, supabase: client };

        try {
            switch (pending.type) {
                case 'RECORD_SALE':
                    await SaleHandler.commit(context, pending);
                    break;
                case 'RECORD_EXPENSE':
                    await ExpenseHandler.commit(context, pending);
                    break;
                case 'SEND_PROMO':
                    await PromoHandler.commit(context, pending);
                    break;
                case 'VOID_SALE':
                    await VoidHandler.commit(context, pending);
                    break;
                default:
                    console.warn('[WhatsApp] Unknown pending action type:', pending.type);
                    return WhatsAppService.sendText(phoneNumber, "Action confirmed but I couldn't find the pending task.");
            }
            await this.logMessage(binding.tenant_id, phoneNumber, 'outbound', `COMMIT_${pending.type}`, "Staged action committed", true, undefined, client);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error(`[WhatsApp] Commit error for ${pending.type}:`, err);
            await this.logMessage(binding.tenant_id, phoneNumber, 'outbound', `COMMIT_${pending.type}`, "Commit failed", false, message, client);
            return WhatsAppService.sendText(phoneNumber, "❌ Failed to complete the action. Please try again.");
        }
    }

    // ─── Greeters & Menus ──────────────────────────────────────────────────────
    
    private static async handleGreeting(phoneNumber: string, binding: WhatsAppBinding | null, result: IntentResult) {
        const name = binding?.tenant_name || 'Business Owner';
        const greeting = result.response_text || `Hello ${name}! 👋 I'm Amina, your SOLO Assistant. How's market today?`;
        await WhatsAppService.sendText(phoneNumber, greeting);
    }

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
                    { id: "menu_add_stock", title: "Update Stock", description: "Update existing stock qty" },
                    { id: "menu_add_product", title: "Add Product", description: "Add a new product to store" },
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
        return WhatsAppService.sendList(phoneNumber, bodyText, "View Commands", sections);
    }

    // ─── Account Linking & OTP ──────────────────────────────────────────────────

    private static async handleLinkAccount(phoneNumber: string, entities: { code?: string; email?: string }, supabase: SupabaseClient) {
        const { code, email } = entities;
        if (!code && !email) {
            return WhatsAppService.sendText(phoneNumber, "To link your SOLO account, reply with your *link code* or your *registered email address*.");
        }

        let tenantId: string | null = null;
        if (code) {
            const { data } = await supabase.from('tenants').select('id').eq('whatsapp_link_code', code.toUpperCase().trim()).maybeSingle();
            tenantId = data?.id || null;
        } else if (email) {
            const { data: profileMatch } = await supabase.from('profiles').select('tenant_id').eq('email', email.toLowerCase().trim()).maybeSingle();
            tenantId = profileMatch?.tenant_id || null;
            if (!tenantId) {
                const { data: staffMatch } = await supabase.from('staff_members').select('tenant_id').eq('email', email.toLowerCase().trim()).maybeSingle();
                tenantId = staffMatch?.tenant_id || null;
            }
        }

        if (!tenantId) {
            return WhatsAppService.sendText(phoneNumber, "❌ I couldn't find a SOLO account with that code or email.");
        }

        const otp = await WhatsAppAuthService.initiateBinding(phoneNumber, tenantId);
        return WhatsAppService.sendText(phoneNumber, `🔐 *Your SOLO Verification Code*\n\n*${otp}*\n\nReply with this 6-digit code to complete linking.`);
    }

    private static async handleVerifyOtp(phoneNumber: string, entities: { otp?: string }, supabase: SupabaseClient) {
        const { otp } = entities;
        if (!otp) return WhatsAppService.sendText(phoneNumber, "Please reply with your 6-digit verification code.");

        const result = await WhatsAppAuthService.verifyAndBind(phoneNumber, otp, supabase);
        if (result.success) {
            return WhatsAppService.sendText(phoneNumber, "✅ *Account Linked Successfully!*\n\nYour SOLO account is now connected.");
        }
        return WhatsAppService.sendText(phoneNumber, "❌ Verification failed. Please try again.");
    }

    // ─── Proactive Intelligence ──────────────────────────────────────────────────

    public static async triggerRestockAlerts(tenantId: string, phoneNumber: string, supabase: SupabaseClient) {
        const stats = await AnalyticsService.getDashboardStats(tenantId, '7d', undefined, supabase);
        const lowStockItems = stats.stockAlerts;
        if (lowStockItems.length === 0) return;

        const itemsList = lowStockItems.map((item) => `• ${item.productName} (${item.currentStock} left)`).join('\n');
        const response = `⚠️ *Low Stock Alert*\n\n${itemsList}\n\n_Reply \"ADVICE\" for restock recommendations._`;
        await WhatsAppService.sendText(phoneNumber, response);
    }

    // ─── Internal Logging ────────────────────────────────────────────────────────

    private static async logMessage(tenantId: string, phoneNumber: string, direction: 'inbound' | 'outbound', intent: string, content: string, success: boolean = true, errorMessage?: string, supabase?: SupabaseClient) {
        try {
            const client = await this.getClient(supabase);
            await client.from('whatsapp_message_log').insert({
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
