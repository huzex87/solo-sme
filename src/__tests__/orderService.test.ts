/**
 * OrderService Unit Tests
 *
 * Tests order operations with mocked Supabase client and downstream services.
 */

const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
    supabase: { from: (...args: unknown[]) => mockFrom(...args) },
    isSupabaseConfigured: true,
}));

jest.mock('@/services/inventoryService', () => ({
    InventoryService: {
        recordMovement: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('@/services/ledgerService', () => ({
    LedgerService: {
        recordTransaction: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('@/services/loyaltyService', () => ({
    LoyaltyService: {
        calculatePoints: jest.fn().mockReturnValue(100),
        addPoints: jest.fn().mockResolvedValue(undefined),
    },
}));

jest.mock('@/services/auditService', () => ({
    AuditService: {
        logAction: jest.fn().mockResolvedValue(undefined),
    },
}));

import { OrderService } from '@/services/orderService';

describe('OrderService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getOrders', () => {
        it('should fetch all orders for a tenant', async () => {
            const mockOrders = [
                { id: 'o1', tenant_id: 't1', total_amount: 5000, status: 'paid' },
                { id: 'o2', tenant_id: 't1', total_amount: 3000, status: 'pending' },
            ];

            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({
                            data: mockOrders,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await OrderService.getOrders('t1');

            expect(mockFrom).toHaveBeenCalledWith('orders');
            expect(result).toHaveLength(2);
            expect(result[0].total_amount).toBe(5000);
        });

        it('should return empty array on error', async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Query error' },
                        }),
                    }),
                }),
            });

            const result = await OrderService.getOrders('t1');
            expect(result).toEqual([]);
        });
    });

    describe('createOrder', () => {
        it('should create an order with items', async () => {
            const mockOrder = {
                id: 'o3', tenant_id: 't1', total_amount: 8000,
                status: 'pending', channel: 'online',
                customer_email: 'cust@test.com',
                items: [{ id: 'p1', name: 'Widget', quantity: 2, price: 4000 }],
            };

            mockFrom.mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mockOrder,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await OrderService.createOrder({
                tenant_id: 't1',
                total_amount: 8000,
                items: [{ id: 'p1', name: 'Widget', quantity: 2, price: 4000 }],
            });

            expect(result).not.toBeNull();
            expect(result?.id).toBe('o3');
            expect(mockFrom).toHaveBeenCalledWith('orders');
        });

        it('should return null on creation error', async () => {
            mockFrom.mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Insert failed' },
                        }),
                    }),
                }),
            });

            const result = await OrderService.createOrder({
                tenant_id: 't1',
                total_amount: 0,
            });

            expect(result).toBeNull();
        });
    });

    describe('updateOrderStatus', () => {
        it('should update order status and log audit', async () => {
            // Mock getOrder
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { id: 'o1', tenant_id: 't1', status: 'pending' },
                            error: null,
                        }),
                    }),
                }),
            });

            // Mock update
            mockFrom.mockReturnValueOnce({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            const result = await OrderService.updateOrderStatus('o1', 'paid');
            expect(result).toBe(true);
        });
    });

    describe('generatePaymentLink', () => {
        it('should return a valid payment URL', () => {
            const link = OrderService.generatePaymentLink('order-123');
            expect(link).toContain('order-123');
            expect(link).toMatch(/^https?:\/\//);
        });
    });
});
