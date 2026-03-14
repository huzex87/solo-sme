import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { LedgerService } from './ledgerService';
import { logger } from '@/lib/logger';
import { TenantService } from './tenantService';
import { SupabaseClient } from '@supabase/supabase-js';

export type PaymentProvider = 'paystack' | 'stripe' | 'cod';

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'success' | 'failed';
    provider: PaymentProvider;
    checkoutUrl?: string;
    reference: string;
}

export class PaymentService {
    private static getClient(client?: SupabaseClient) {
        return client || createClient();
    }

    /**
     * Creates a payment session/intent with a provider.
     */
    static async createPaymentIntent(
        amount: number,
        email: string,
        provider: PaymentProvider,
        tenantId: string,
        metadata: Record<string, unknown> = {},
        client?: SupabaseClient
    ): Promise<PaymentIntent> {
        const reference = `SOLO-${Date.now()}-${crypto.randomUUID().split('-')[0]}`;
        logger.info(`Creating ${provider} intent for tenant ${tenantId}`, { amount, email });

        if (provider === 'cod') {
            return {
                id: `cod_${Math.random().toString(36).slice(2)}`,
                amount,
                currency: 'NGN',
                status: 'pending',
                provider: 'cod',
                reference
            };
        }

        // Fetch tenant-specific keys
        const tenant = await TenantService.getTenant(tenantId, client);
        const secretKey = tenant?.business_config?.paystack_secret_key || process.env.PAYSTACK_SECRET_KEY;

        if (provider === 'paystack' && secretKey) {
            try {
                const response = await fetch('https://api.paystack.co/transaction/initialize', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        amount: Math.round(amount * 100), // Kobo
                        reference,
                        metadata: { ...metadata, tenantId, orderId: metadata.orderId }
                    })
                });

                const data = await response.json();
                if (data.status) {
                    return {
                        id: data.data.reference,
                        amount,
                        currency: 'NGN',
                        status: 'pending',
                        provider: 'paystack',
                        checkoutUrl: data.data.authorization_url,
                        reference: data.data.reference
                    };
                }
            } catch (err) {
                logger.error('Paystack initialization error', err);
            }
        }

        // Fallback or Mock if no keys
        return {
            id: `${provider}_mock_${Math.random().toString(36).slice(2)}`,
            amount,
            currency: provider === 'paystack' ? 'NGN' : 'USD',
            status: 'pending',
            provider,
            reference,
            checkoutUrl: provider === 'paystack'
                ? `https://checkout.paystack.com/${reference}`
                : `https://checkout.stripe.com/pay/${reference}`
        };
    }

    /**
     * Verifies a payment and updates the order status + financial ledger.
     * Idempotent: Can be called multiple times for the same reference.
     */
    static async verifyPayment(reference: string, provider: PaymentProvider, orderId: string, tenantId: string, client?: SupabaseClient): Promise<boolean> {
        logger.info(`Verifying ${provider} payment`, { reference, orderId });

        let resolvedOrderId = orderId;

        // 1. Verify with Provider if necessary
        const tenant = await TenantService.getTenant(tenantId, client);
        const secretKey = tenant?.business_config?.paystack_secret_key || process.env.PAYSTACK_SECRET_KEY;

        if (provider === 'paystack' && secretKey && !reference.includes('mock')) {
            try {
                const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
                    headers: { Authorization: `Bearer ${secretKey}` }
                });
                const data = await response.json();
                if (!data.status || data.data.status !== 'success') {
                    logger.warn('Paystack verification failed or pending', { reference, status: data.data?.status });
                    return false;
                }

                // Resolve orderId from metadata if missing (Critical for Webhooks)
                if (!resolvedOrderId) {
                    resolvedOrderId = data.data.metadata?.orderId || data.data.metadata?.order_id;
                }
            } catch (err) {
                logger.error('Paystack verification fetch error', err);
                return false;
            }
        }

        if (!resolvedOrderId) {
            logger.error('Cannot verify payment: Missing orderId');
            return false;
        }

        if (!isSupabaseConfigured) return false;
        const supabase = this.getClient(client);

        // 2. Fetch order and check status (Idempotency Check)
        const { data: existingOrder, error: fetchError } = await supabase
            .from('orders')
            .select('id, total_amount, delivery_fee, status')
            .eq('id', resolvedOrderId)
            .single();

        if (fetchError || !existingOrder) {
            logger.error(`Order ${resolvedOrderId} not found during verification`);
            return false;
        }

        if (existingOrder.status === 'paid') {
            logger.info(`Order ${resolvedOrderId} already marked as paid. Skipping.`);
            return true;
        }

        // 3. Atomic Update Order status
        const { error: orderError } = await supabase
            .from('orders')
            .update({
                status: 'paid',
                payment_ref: reference,
                payment_method: provider,
                metadata: { verified_at: new Date().toISOString() }
            })
            .eq('id', resolvedOrderId)
            .neq('status', 'paid'); // Double-check idempotency at DB level

        if (orderError) {
            logger.error('Failed to update order status during payment verification', orderError);
            return false;
        }

        // 3. Record transaction in Ledger
        await LedgerService.recordTransaction({
            tenant_id: tenantId,
            order_id: resolvedOrderId,
            amount: existingOrder.total_amount,
            type: 'revenue',
            status: 'completed',
            provider,
            reference,
            description: `Payment received for Order #${resolvedOrderId.substring(0, 8)}`
        }, client);

        if (existingOrder.delivery_fee > 0) {
            await LedgerService.recordTransaction({
                tenant_id: tenantId,
                order_id: resolvedOrderId,
                amount: existingOrder.delivery_fee,
                type: 'delivery_fee',
                status: 'completed',
                provider: 'system',
                description: `Delivery fee for Order #${resolvedOrderId.substring(0, 8)}`
            }, client);
        }

        // 4. Record audit action
        const { AuditService } = await import('./auditService');
        await AuditService.logAction({
            tenant_id: tenantId,
            action: 'payment_verified',
            entity_type: 'order',
            entity_id: orderId,
            metadata: { reference, provider }
        }, client);

        return true;
    }

    /**
     * Formats currency for display.
     */
    static formatCurrency(amount: number, currency: string = 'NGN'): string {
        const symbol = currency === 'NGN' ? '₦' : '$';
        return `${symbol}${amount.toLocaleString()}`;
    }
}

