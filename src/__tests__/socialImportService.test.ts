import { SocialImportService } from '@/services/socialImportService';
import { ProductService } from '@/services/productService';
import { AuditService } from '@/services/auditService';
import { createClient } from '@/lib/supabase/client';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
    createClient: jest.fn(),
}));

// Mock Services
jest.mock('@/services/productService', () => ({
    ProductService: {
        getProducts: jest.fn(),
        createProduct: jest.fn(),
    },
}));

jest.mock('@/services/auditService', () => ({
    AuditService: {
        logAction: jest.fn(),
    },
}));

jest.mock('@/lib/logger', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

// Mock fetch
global.fetch = jest.fn();

describe('SocialImportService', () => {
    const tenantId = 'test-tenant-id';
    const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        upsert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockReturnValue(mockSupabase);
    });

    describe('getInstagramAuthUrl', () => {
        it('generates a valid Meta OAuth URL', () => {
            const url = SocialImportService.getInstagramAuthUrl(tenantId);
            expect(url).toContain('https://www.facebook.com/v19.0/dialog/oauth');
            expect(url).toContain('client_id=');
            expect(url).toContain('scope=');
            expect(url).toContain(btoa(JSON.stringify({ tenantId, platform: 'instagram' })));
        });
    });

    describe('importFromInstagram', () => {
        it('returns an error if no connected account is found', async () => {
            mockSupabase.single.mockResolvedValue({ data: null, error: null });

            const result = await SocialImportService.importFromInstagram(tenantId);
            expect(result.errors).toContain('No connected Instagram account found');
            expect(result.products).toHaveLength(0);
        });

        it('fetches media and extracts products using AI fallback', async () => {
            const mockAccount = {
                id: 'acc-1',
                platform_user_id: 'user-1',
                access_token: 'token-1',
            };
            mockSupabase.single.mockResolvedValue({ data: mockAccount, error: null });

            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    json: jest.fn().mockResolvedValue({
                        data: [
                            {
                                id: 'post-1',
                                caption: 'New arrival! Custom Dress only N15,000. #fashion',
                                media_type: 'IMAGE',
                                permalink: 'https://instagr.am/p/1',
                                media_url: 'https://img.url/1',
                            }
                        ]
                    })
                })
                .mockResolvedValueOnce({ // AI extraction mock - simulating failure to trigger regex fallback
                    ok: false
                });

            const result = await SocialImportService.importFromInstagram(tenantId, { useAI: true });

            expect(result.products).toHaveLength(1);
            expect(result.products[0].name).toContain('New arrival');
            expect(result.products[0].price).toBe(15000);
            expect(result.products[0].category).toBe('Fashion');
        });
    });

    describe('importFromWhatsAppCatalog', () => {
        it('fetches products from WhatsApp Catalog', async () => {
            const mockAccount = {
                id: 'acc-wa',
                platform_user_id: 'wa-user-1',
                access_token: 'wa-token-1',
            };
            mockSupabase.single.mockResolvedValue({ data: mockAccount, error: null });

            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({ // Catalog fetch
                    json: jest.fn().mockResolvedValue({ data: [{ id: 'cat-1' }] })
                })
                .mockResolvedValueOnce({ // Products fetch
                    json: jest.fn().mockResolvedValue({
                        data: [
                            {
                                id: 'wa-prod-1',
                                name: 'WA Product',
                                description: 'WA Desc',
                                price: '5000',
                                availability: 'in_stock',
                                image_url: 'wa-img',
                            }
                        ]
                    })
                });

            const result = await SocialImportService.importFromWhatsAppCatalog(tenantId);

            expect(result.added).toBe(1);
            expect(result.products[0].name).toBe('WA Product');
            expect(result.products[0].price).toBe(5000);
        });
    });

    describe('handleOAuthCallback', () => {
        it('handles WhatsApp Business OAuth callback successfully', async () => {
            const code = 'auth-code';
            const state = btoa(JSON.stringify({ tenantId, platform: 'whatsapp_business' }));

            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({ // code for token exchange
                    json: jest.fn().mockResolvedValue({ access_token: 'short-token' })
                })
                .mockResolvedValueOnce({ // long-lived token exchange
                    json: jest.fn().mockResolvedValue({ access_token: 'long-token' })
                })
                .mockResolvedValueOnce({ // business fetch
                    json: jest.fn().mockResolvedValue({ data: [{ id: 'biz-1', name: 'Biz Name' }] })
                })
                .mockResolvedValueOnce({ // WABA fetch
                    json: jest.fn().mockResolvedValue({ data: [{ id: 'waba-1', name: 'WABA Name' }] })
                });

            mockSupabase.select.mockReturnThis();
            mockSupabase.single.mockResolvedValue({ data: { id: 'new-acc-id' }, error: null });

            const result = await SocialImportService.handleOAuthCallback(code, state);

            expect(result.success).toBe(true);
            expect(result.account?.id).toBe('new-acc-id');
            expect(mockSupabase.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    platform: 'whatsapp_business',
                    account_name: 'WABA Name',
                }),
                expect.any(Object)
            );
        });
    });

    describe('finalizeImport', () => {
        it('saves products and avoids duplicates', async () => {
            const products = [
                {
                    name: 'New Product',
                    description: 'Desc',
                    price: 1000,
                    category: 'General',
                    image_url: 'img',
                    stock: 10,
                    source: 'instagram' as const,
                }
            ];

            (ProductService.getProducts as jest.Mock).mockResolvedValue([]);
            (ProductService.createProduct as jest.Mock).mockResolvedValue({ id: 'prod-1' });

            const result = await SocialImportService.finalizeImport(tenantId, products);

            expect(result.saved).toBe(1);
            expect(ProductService.createProduct).toHaveBeenCalled();
            expect(AuditService.logAction).toHaveBeenCalledWith(
                expect.objectContaining({ action: 'social_import_completed' }),
                undefined
            );
        });

        it('skips existing products by name', async () => {
            const products = [
                {
                    name: 'Existing Product',
                    description: 'Desc',
                    price: 1000,
                    category: 'General',
                    image_url: 'img',
                    stock: 10,
                    source: 'instagram' as const,
                }
            ];

            (ProductService.getProducts as jest.Mock).mockResolvedValue([{ name: 'Existing Product' }]);

            const result = await SocialImportService.finalizeImport(tenantId, products);

            expect(result.saved).toBe(0);
            expect(result.skipped).toBe(1);
            expect(ProductService.createProduct).not.toHaveBeenCalled();
        });
    });
});
