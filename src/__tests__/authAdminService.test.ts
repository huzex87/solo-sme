/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AuthAdminService Unit Tests
 *
 * Tests server-side authentication operations including tenant creation and profile bootstrapping.
 */

const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: 'tenant-1' }, error: null }),
};

const mockAuthClient = {
    auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
    },
    from: jest.fn(() => mockQueryBuilder),
};

const mockAdminClient = {
    from: jest.fn(() => mockQueryBuilder),
};

jest.mock('@/lib/supabase/server', () => ({
    createAdminClient: jest.fn().mockResolvedValue(mockAdminClient),
}));

jest.mock('@/lib/rateLimit', () => ({
    ratelimit: {
        limit: jest.fn().mockResolvedValue({ success: true }),
    },
    signupRatelimit: {
        limit: jest.fn().mockResolvedValue({ success: true }),
    },
}));

jest.mock('@/lib/supabase/client', () => ({
    createClient: jest.fn(() => mockAuthClient),
}));

jest.mock('@/lib/supabase/config', () => ({
    isSupabaseConfigured: true,
}));

jest.mock('@/services/emailService', () => ({
    EmailService: {
        sendWelcome: jest.fn().mockResolvedValue({}),
    },
}));

import { AuthAdminService } from '@/services/authAdminService';

describe('AuthAdminService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockQueryBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });
        mockQueryBuilder.single.mockResolvedValue({ data: { id: 'tenant-1' }, error: null });
        mockAuthClient.auth.signInWithPassword.mockResolvedValue({
            data: { user: { id: 'user-123' }, session: { access_token: 'token' } },
            error: null,
        });
        mockAuthClient.auth.signUp.mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
        });
    });

    describe('signIn', () => {
        it('should sign in with email and password', async () => {
            const result = await AuthAdminService.signIn('test@test.com', 'password123', mockAuthClient as any);

            expect(mockAuthClient.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@test.com',
                password: 'password123',
            });
            expect(result.data).toBeDefined();
        });
    });

    describe('isSubdomainAvailable', () => {
        it('should return true if subdomain is not taken', async () => {
            mockQueryBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });

            const available = await AuthAdminService.isSubdomainAvailable('new-store', mockAuthClient as any);
            expect(available).toBe(true);
        });

        it('should return false if subdomain is taken', async () => {
            mockQueryBuilder.maybeSingle.mockResolvedValue({ data: { id: 'existing' }, error: null });

            const available = await AuthAdminService.isSubdomainAvailable('taken-store', mockAuthClient as any);
            expect(available).toBe(false);
        });
    });

    describe('signUp', () => {
        it('should register a new business and user', async () => {
            const result = await AuthAdminService.signUp(
                'test@test.com',
                'password123',
                'Test Store',
                'test-store',
                'Test User',
                mockAuthClient as any
            );

            expect(mockAuthClient.auth.signUp).toHaveBeenCalled();
            expect(mockAdminClient.from).toHaveBeenCalledWith('tenants');
            expect(mockAdminClient.from).toHaveBeenCalledWith('profiles');
            expect(result.data?.tenant_id).toBe('tenant-1');
        });
    });
});
