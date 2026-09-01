/**
 * ProductService Unit Tests
 *
 * Tests CRUD operations with mocked Supabase client.
 */

const mockFrom = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        from: (...args: unknown[]) => mockFrom(...args),
    }),
}));

// BaseService.getClient() resolves to the server admin client in node (test)
// env, so mock it to the same query builder — otherwise createAdminClient()
// throws when SUPABASE_SERVICE_ROLE_KEY is unset (as it is in CI).
jest.mock('@/lib/supabase/server', () => ({
    createAdminClient: jest.fn().mockResolvedValue({
        from: (...args: unknown[]) => mockFrom(...args),
    }),
    createClient: jest.fn().mockResolvedValue({
        from: (...args: unknown[]) => mockFrom(...args),
    }),
}));

jest.mock('@/lib/supabase/config', () => ({
    isSupabaseConfigured: true,
}));

jest.mock('@/services/auditService', () => ({
    AuditService: {
        logAction: jest.fn().mockResolvedValue(undefined),
    },
}));

import { ProductService } from '@/services/productService';

describe('ProductService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProducts', () => {
        it('should fetch all products for a tenant', async () => {
            const mockProducts = [
                { id: 'p1', tenant_id: 't1', name: 'Widget', price: 1500 },
                { id: 'p2', tenant_id: 't1', name: 'Gadget', price: 3000 },
            ];

            // Real chain: .from('products').select('*').eq('tenant_id', …).order('created_at', …)
            // then the query is awaited, so .order() resolves to { data, error }.
            const resolvedQuery = { data: mockProducts, error: null };
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue(resolvedQuery),
                    }),
                }),
            });

            const result = await ProductService.getProducts('t1');

            expect(mockFrom).toHaveBeenCalledWith('products');
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Widget');
        });

        it('should return empty array on error', async () => {
            const errorQuery = { data: null, error: { message: 'Connection failed' } };
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            order: jest.fn().mockResolvedValue(errorQuery),
                        }),
                    }),
                }),
            });

            const result = await ProductService.getProducts('t1');
            expect(result).toEqual([]);
        });
    });

    describe('createProduct', () => {
        it('should create a product and log audit', async () => {
            const newProduct = { tenant_id: 't1', name: 'New Widget', price: 2000 };

            mockFrom.mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { id: 'p3', ...newProduct },
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await ProductService.createProduct(newProduct);

            expect(result).not.toBeNull();
            expect(result?.name).toBe('New Widget');
            expect(mockFrom).toHaveBeenCalledWith('products');
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

            const result = await ProductService.createProduct({ name: 'Fail' });
            expect(result).toBeNull();
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product and return true', async () => {
            mockFrom.mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null }),
                }),
            });

            const result = await ProductService.deleteProduct('p1');
            expect(result).toBe(true);
        });

        it('should return false on delete error', async () => {
            mockFrom.mockReturnValue({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        error: { message: 'Not found' },
                    }),
                }),
            });

            const result = await ProductService.deleteProduct('missing');
            expect(result).toBe(false);
        });
    });
});
