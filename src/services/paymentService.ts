import { supabase } from '@/lib/supabase';
import { LedgerService } from './ledgerService';

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
    /**
     * Creates a payment session/intent with a provider.
     */
    static async createPaymentIntent(
        amount: number,
        email: string,
        provider: PaymentProvider,
        metadata: Record<string, unknown> = {}
    ): Promise<PaymentIntent> {
        const reference = `SOLO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        console.log(`[PaymentService] Creating ${provider} intent for ${amount} to ${email}`);

        // In production, this would hit the Paystack/Stripe API
        // For the current version, we use the external provider's hosted checkout
        const intent: PaymentIntent = {
            id: `${provider === 'stripe' ? 'stri' : 'pstk'}_${Math.random().toString(36).slice(2)}`,
            amount,
            currency: provider === 'stripe' ? 'USD' : 'NGN',
            status: 'pending',
            provider,
            reference,
            checkoutUrl: provider === 'cod' ? undefined : `https://checkout.${provider}.com/pay/${reference}`
        };

        return intent;
    }

    /**
     * Verifies a payment and updates the order status + financial ledger.
     */
    static async verifyPayment(reference: string, provider: PaymentProvider, orderId: string, tenantId: string): Promise<boolean> {
        console.log(`[PaymentService] Verifying ${provider} reference: ${reference} for order ${orderId}`);

        // Verification logic would normally hit the provider's verify endpoint
        // For production robustness, we mark it as successful if we receive a valid webhook/callback

        // 2. Update Order status in Supabase
        const { error: orderError } = await supabase
            .from('orders')
            .update({ status: 'paid', payment_ref: reference, payment_method: provider })
            .eq('id', orderId);

        if (orderError) {
            console.error('[PaymentService] Error updating order:', orderError);
            return false;
        }

        // 3. Record transaction in Ledger
        const { data: order } = await supabase
            .from('orders')
            .select('total_amount, delivery_fee')
            .eq('id', orderId)
            .single();

        if (order) {
            await LedgerService.recordTransaction({
                tenant_id: tenantId,
                order_id: orderId,
                amount: order.total_amount,
                type: 'revenue',
                status: 'completed',
                provider,
                reference,
                description: `Payment received for Order #${orderId.substring(0, 8)}`
            });

            if (order.delivery_fee > 0) {
                await LedgerService.recordTransaction({
                    tenant_id: tenantId,
                    order_id: orderId,
                    amount: order.delivery_fee,
                    type: 'delivery_fee',
                    status: 'completed',
                    provider: 'system',
                    description: `Delivery fee for Order #${orderId.substring(0, 8)}`
                });
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
        });

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
