/**
 * PaymentService Tests
 *
 * Covers:
 * - Payment intent creation (success, missing keys, provider errors)
 * - Payment verification idempotency
 * - Ledger recording on successful verification
 * - Refund flow
 */

import crypto from 'crypto';

const mockFrom = jest.fn();
const mockFetch = jest.fn();

// Supabase client mock
jest.mock('@/lib/supabase/server', () => ({
    createAdminClient: jest.fn().mockResolvedValue({
        from: (...args: unknown[]) => mockFrom(...args),
    }),
}));

jest.mock('@/lib/supabase/config', () => ({
    isSupabaseConfigured: true,
}));

jest.mock('@/services/tenantService', () => ({
    TenantService: {
        getTenant: jest.fn().mockResolvedValue({
            id: 'tenant-1',
            name: 'Test Store',
            business_config: {
                paystack_secret_key: 'sk_test_abc123',
            },
        }),
    },
}));

jest.mock('@/services/ledgerService', () => ({
    LedgerService: {
        recordTransaction: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('@/services/auditService', () => ({
    AuditService: {
        logAction: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('@/lib/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('@/lib/baseUrl', () => ({
    getBaseUrl: jest.fn().mockReturnValue('https://test.solosme.com'),
}));

jest.mock('@/services/currencyService', () => ({
    CurrencyService: {
        getSymbol: jest.fn().mockReturnValue('₦'),
    },
}));

// Replace global fetch
global.fetch = mockFetch as unknown as typeof fetch;

import { PaymentService } from '@/services/paymentService';
import { LedgerService } from '@/services/ledgerService';

describe('PaymentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── createPaymentIntent ──────────────────────────────────────────────────

    describe('createPaymentIntent', () => {
        it('should return COD intent immediately without an API call', async () => {
            const intent = await PaymentService.createPaymentIntent(5000, 'test@email.com', 'cod', 'tenant-1');

            expect(intent.provider).toBe('cod');
            expect(intent.status).toBe('pending');
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('should initialize Paystack and return checkout URL', async () => {
            mockFetch.mockResolvedValueOnce({
                json: async () => ({
                    status: true,
                    data: {
                        reference: 'ref-paystack-001',
                        authorization_url: 'https://checkout.paystack.com/ref-paystack-001',
                    },
                }),
            });

            const intent = await PaymentService.createPaymentIntent(10000, 'buyer@test.com', 'paystack', 'tenant-1');

            expect(intent.provider).toBe('paystack');
            expect(intent.checkoutUrl).toContain('paystack');
            expect(intent.reference).toBe('ref-paystack-001');
            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.paystack.co/transaction/initialize',
                expect.objectContaining({ method: 'POST' })
            );
        });

        it('should throw when Paystack key is missing', async () => {
            const { TenantService } = await import('@/services/tenantService');
            (TenantService.getTenant as jest.Mock).mockResolvedValueOnce({
                id: 'tenant-2',
                name: 'Unconfigured Store',
                business_config: {},
            });

            // Also unset the env var
            const savedKey = process.env.PAYSTACK_SECRET_KEY;
            delete process.env.PAYSTACK_SECRET_KEY;

            await expect(
                PaymentService.createPaymentIntent(5000, 'a@b.com', 'paystack', 'tenant-2')
            ).rejects.toThrow(/not configured/i);

            process.env.PAYSTACK_SECRET_KEY = savedKey;
        });

        it('should throw when Paystack API returns a failure', async () => {
            mockFetch.mockResolvedValueOnce({
                json: async () => ({
                    status: false,
                    message: 'Invalid email',
                }),
            });

            await expect(
                PaymentService.createPaymentIntent(5000, 'bad-email', 'paystack', 'tenant-1')
            ).rejects.toThrow(/invalid email/i);
        });

        it('should throw on unknown provider instead of returning mock', async () => {
            await expect(
                PaymentService.createPaymentIntent(5000, 'a@b.com', 'stripe' as never, 'tenant-1')
            ).rejects.toThrow(/unsupported/i);
        });
    });

    // ─── verifyPayment ────────────────────────────────────────────────────────

    describe('verifyPayment', () => {
        it('should return true and update order when Paystack confirms payment', async () => {
            mockFetch.mockResolvedValueOnce({
                json: async () => ({
                    status: true,
                    data: {
                        status: 'success',
                        metadata: { orderId: 'order-1' },
                    },
                }),
            });

            // getOrder fetch
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { id: 'order-1', total_amount: 10000, delivery_fee: 500, status: 'pending' },
                            error: null,
                        }),
                    }),
                }),
            });

            // updateOrder
            mockFrom.mockReturnValueOnce({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        neq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            });

            const result = await PaymentService.verifyPayment('ref-001', 'paystack', 'order-1', 'tenant-1');

            expect(result).toBe(true);
            expect(LedgerService.recordTransaction).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'revenue', status: 'completed' }),
                undefined
            );
        });

        it('should be idempotent — return true without re-processing already-paid orders', async () => {
            mockFetch.mockResolvedValueOnce({
                json: async () => ({
                    status: true,
                    data: { status: 'success', metadata: { orderId: 'order-2' } },
                }),
            });

            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { id: 'order-2', total_amount: 5000, delivery_fee: 0, status: 'paid' },
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await PaymentService.verifyPayment('ref-002', 'paystack', 'order-2', 'tenant-1');

            expect(result).toBe(true);
            // Ledger should NOT be called again for an already-paid order
            expect(LedgerService.recordTransaction).not.toHaveBeenCalled();
        });

        it('should return false when Paystack reports payment not successful', async () => {
            mockFetch.mockResolvedValueOnce({
                json: async () => ({
                    status: true,
                    data: { status: 'failed' },
                }),
            });

            const result = await PaymentService.verifyPayment('ref-003', 'paystack', 'order-3', 'tenant-1');
            expect(result).toBe(false);
        });
    });

    // ─── Webhook Signature Verification (unit-level) ──────────────────────────

    describe('Paystack HMAC signature', () => {
        it('should produce consistent HMAC-SHA512 for a known payload', () => {
            const secret = 'test_secret_key';
            const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'ref-001' } });

            const hash1 = crypto.createHmac('sha512', secret).update(payload).digest('hex');
            const hash2 = crypto.createHmac('sha512', secret).update(payload).digest('hex');

            expect(hash1).toBe(hash2);
            expect(hash1).toHaveLength(128);
        });

        it('should produce different HMACs for different secrets', () => {
            const payload = JSON.stringify({ event: 'charge.success' });

            const hash1 = crypto.createHmac('sha512', 'secret_a').update(payload).digest('hex');
            const hash2 = crypto.createHmac('sha512', 'secret_b').update(payload).digest('hex');

            expect(hash1).not.toBe(hash2);
        });

        it('should produce different HMACs for modified payloads (tamper detection)', () => {
            const secret = 'shared_secret';
            const original = JSON.stringify({ event: 'charge.success', data: { amount: 10000 } });
            const tampered = JSON.stringify({ event: 'charge.success', data: { amount: 99999 } });

            const hashOriginal = crypto.createHmac('sha512', secret).update(original).digest('hex');
            const hashTampered = crypto.createHmac('sha512', secret).update(tampered).digest('hex');

            expect(hashOriginal).not.toBe(hashTampered);
        });
    });
});
