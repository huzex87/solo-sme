import { createAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { LedgerService } from './ledgerService';
import { logger } from '@/lib/logger';
import { TenantService } from './tenantService';
import { SupabaseClient } from '@supabase/supabase-js';
import { getBaseUrl } from '@/lib/baseUrl';
import { CurrencyService } from './currencyService';

export type PaymentProvider = 'paystack' | 'stripe' | 'cod' | 'flutterwave';

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
    private static async resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
        if (client) return client;
        return createAdminClient();
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
        _client?: SupabaseClient
    ): Promise<PaymentIntent> {
        // Fetch tenant-specific keys and config. Reading payment secrets is a
        // privileged server operation, so always use the service-role client —
        // the anon/public client (used for guest checkout) has no access to the
        // base `tenants` table.
        const tenant = await TenantService.getTenant(tenantId, await createAdminClient());
        const currency = tenant?.currency || 'NGN';
        const reference = (metadata.reference as string) || (metadata.tx_ref as string) || `SOLO_${Math.random().toString(36).slice(2, 10).toUpperCase()}_${Date.now()}`;

        if (provider === 'cod') {
            return {
                id: `cod_${Math.random().toString(36).slice(2)}`,
                amount,
                currency,
                status: 'pending',
                provider: 'cod',
                reference
            };
        }

        // Fetch tenant-specific keys
        const tenantHasOwnKey = !!tenant?.business_config?.paystack_secret_key;
        const secretKey = tenant?.business_config?.paystack_secret_key || process.env.PAYSTACK_SECRET_KEY;

        if (provider === 'paystack') {
            if (!secretKey) {
                logger.error(`Paystack secret key not configured for tenant ${tenantId}`);
                throw new Error('Payment provider is not configured. Please add your Paystack secret key in Settings → Payments.');
            }
            try {
                const subaccountCode = tenant?.business_config?.paystack_subaccount_code;
                const paystackPayload: Record<string, unknown> = {
                    email,
                    amount: Math.round(amount * 100), // Kobo
                    reference,
                    metadata: { ...metadata, tenantId, orderId: metadata.orderId }
                };

                // Use subaccount if using platform keys and tenant has provisioned subaccount bank details
                if (!tenantHasOwnKey && subaccountCode) {
                    paystackPayload.subaccount = subaccountCode;
                    paystackPayload.bearer = 'subaccount';
                }

                const response = await fetch('https://api.paystack.co/transaction/initialize', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(paystackPayload)
                });

                const data = await response.json();
                if (data.status) {
                    return {
                        id: data.data.reference,
                        amount,
                        currency,
                        status: 'pending',
                        provider: 'paystack',
                        checkoutUrl: data.data.authorization_url,
                        reference: data.data.reference
                    };
                }
                logger.error('Paystack initialization returned non-success', { message: data.message });
                throw new Error(`Payment initialization failed: ${data.message || 'Unknown Paystack error'}`);
            } catch (err) {
                if (err instanceof Error && err.message.startsWith('Payment')) throw err;
                logger.error('Paystack initialization network error', err);
                throw new Error('Could not reach payment provider. Please try again.');
            }
        }

        const flwSecretKey = tenant?.business_config?.flutterwave_secret_key || process.env.FLUTTERWAVE_SECRET_KEY;
        if (provider === 'flutterwave') {
            if (!flwSecretKey) {
                logger.error(`Flutterwave secret key not configured for tenant ${tenantId}`);
                throw new Error('Payment provider is not configured. Please add your Flutterwave secret key in Settings → Payments.');
            }
            try {
                const response = await fetch('https://api.flutterwave.com/v3/payments', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${flwSecretKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tx_ref: reference,
                        amount: amount,
                        currency,
                        redirect_url: metadata.callback_url || `${getBaseUrl()}/checkout/success`,
                        meta: { ...metadata, tenantId, orderId: metadata.orderId },
                        customer: { email, phonenumber: metadata.phone || '', name: metadata.name || '' },
                        customizations: {
                            title: tenant?.name || 'SOLO Payment',
                            description: `Payment for Order #${metadata.orderId?.toString().substring(0, 8) || reference}`,
                            logo: tenant?.logo_url || ''
                        }
                    })
                });

                const data = await response.json();
                if (data.status === 'success') {
                    return {
                        id: data.data.link,
                        amount,
                        currency,
                        status: 'pending',
                        provider: 'flutterwave',
                        checkoutUrl: data.data.link,
                        reference: reference
                    };
                }
                logger.error('Flutterwave initialization returned non-success', { message: data.message });
                throw new Error(`Payment initialization failed: ${data.message || 'Unknown Flutterwave error'}`);
            } catch (err) {
                if (err instanceof Error && err.message.startsWith('Payment')) throw err;
                logger.error('Flutterwave initialization network error', err);
                throw new Error('Could not reach payment provider. Please try again.');
            }
        }

        throw new Error(`Unsupported payment provider: ${provider}`);
    }

    /**
     * Verifies a payment and updates the order status + financial ledger.
     * Idempotent: Can be called multiple times for the same reference.
     */
    static async verifyPayment(reference: string, provider: PaymentProvider, orderId: string, tenantId: string, client?: SupabaseClient): Promise<boolean> {
        logger.info(`Verifying ${provider} payment`, { reference, orderId });

        let resolvedOrderId = orderId;

        // 1. Verify with Provider if necessary. Reading tenant-held secret keys
        // is privileged — always use the service-role client.
        const tenant = await TenantService.getTenant(tenantId, await createAdminClient());
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

        const flwSecretKey = tenant?.business_config?.flutterwave_secret_key || process.env.FLUTTERWAVE_SECRET_KEY;
        if (provider === 'flutterwave' && flwSecretKey && !reference.includes('mock')) {
            try {
                // Flutterwave verification usually requires ID, but we can search by tx_ref
                const response = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`, {
                    headers: { Authorization: `Bearer ${flwSecretKey}` }
                });
                const data = await response.json();
                if (data.status !== 'success' || data.data.status !== 'successful') {
                    logger.warn('Flutterwave verification failed or pending', { reference, status: data.data?.status });
                    return false;
                }

                if (!resolvedOrderId) {
                    resolvedOrderId = data.data.meta?.orderId || data.data.meta?.order_id;
                }
            } catch (err) {
                logger.error('Flutterwave verification fetch error', err);
                return false;
            }
        }

        if (!resolvedOrderId) {
            logger.error('Cannot verify payment: Missing orderId');
            return false;
        }

        if (!isSupabaseConfigured) return false;
        const supabase = await this.resolveClient(client);

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

        // 3. Record transaction in Ledger (Idempotent updates to prevent double-counting)
        const { data: existingLedger, error: ledgerFetchError } = await supabase
            .from('ledger_entries')
            .select('id')
            .eq('order_id', resolvedOrderId)
            .eq('type', 'revenue')
            .maybeSingle();

        if (!ledgerFetchError && existingLedger) {
            await supabase
                .from('ledger_entries')
                .update({
                    status: 'completed',
                    provider,
                    reference,
                    description: `Payment received for Order #${resolvedOrderId.substring(0, 8)}`,
                    created_at: new Date().toISOString()
                })
                .eq('id', existingLedger.id);
        } else {
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
        }

        if (existingOrder.delivery_fee > 0) {
            const { data: existingFee } = await supabase
                .from('ledger_entries')
                .select('id')
                .eq('order_id', resolvedOrderId)
                .eq('type', 'delivery_fee')
                .maybeSingle();

            if (!existingFee) {
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
     * Initiates a refund for a transaction.
     */
    static async refundPayment(orderId: string, amount?: number, client?: SupabaseClient): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const supabase = await this.resolveClient(client);

        // 1. Fetch order to get transaction details
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            logger.error(`[PaymentService] Refund failed: Order ${orderId} not found`);
            return false;
        }

        if (order.status !== 'paid' && order.status !== 'delivered') {
            logger.error(`[PaymentService] Refund failed: Order ${orderId} status is ${order.status}`);
            return false;
        }

        const refundAmount = amount || order.total_amount;
        // Reading tenant secret keys is privileged — use the service-role client.
        const tenant = await TenantService.getTenant(order.tenant_id, await createAdminClient());
        const secretKey = tenant?.business_config?.paystack_secret_key || process.env.PAYSTACK_SECRET_KEY;

        // 2. Process with Paystack if applicable
        if (order.payment_method === 'paystack' && secretKey && order.payment_ref && !order.payment_ref.includes('mock')) {
            try {
                const response = await fetch('https://api.paystack.co/refund', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        transaction: order.payment_ref,
                        amount: Math.round(refundAmount * 100) // Kobo
                    })
                });

                const data = await response.json();
                if (!data.status) {
                    logger.error('[PaymentService] Paystack refund failed:', data.message);
                    return false;
                }
            } catch (err) {
                logger.error('[PaymentService] Paystack refund error:', err);
                return false;
            }
        }

        // 3. Update Order Status
        const newStatus = refundAmount >= order.total_amount ? 'refunded' : 'partially_refunded';
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);

        // 4. Record in Ledger (Negative Revenue)
        await LedgerService.recordTransaction({
            tenant_id: order.tenant_id,
            order_id: orderId,
            amount: -refundAmount,
            type: 'revenue',
            status: 'completed',
            provider: order.payment_method || 'system',
            description: `Refund for Order #${orderId.substring(0, 8)}`
        }, client);

        return true;
    }

    static formatCurrency(amount: number, currency: string = 'NGN'): string {
        const symbol = CurrencyService.getSymbol(currency);
        return `${symbol}${amount.toLocaleString()}`;
    }
}

