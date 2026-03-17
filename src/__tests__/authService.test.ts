/**
 * AuthService Unit Tests
 *
 * Tests client-side authentication operations with mocked Supabase client.
 */

// Mock Supabase before importing anything
const mockSignInWithOAuth = jest.fn();
const mockSignInWithOtp = jest.fn();
const mockVerifyOtp = jest.fn();
const mockGetSession = jest.fn();
const mockSignOut = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
            signInWithOtp: (...args: unknown[]) => mockSignInWithOtp(...args),
            verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
            getSession: (...args: unknown[]) => mockGetSession(...args),
            signOut: (...args: unknown[]) => mockSignOut(...args),
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { id: 'user-123', role: 'owner' }, error: null }),
        })),
    }),
}));

jest.mock('@/lib/supabase/config', () => ({
    isSupabaseConfigured: true,
}));

import { AuthService } from '@/services/authService';

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('signInWithGoogle', () => {
        it('should trigger Google OAuth sign-in', async () => {
            mockSignInWithOAuth.mockResolvedValue({ data: { url: 'https://google.com' }, error: null });

            const result = await AuthService.signInWithGoogle();

            expect(mockSignInWithOAuth).toHaveBeenCalledWith(expect.objectContaining({
                provider: 'google'
            }));
            expect(result.data?.url).toBe('https://google.com');
        });
    });

    describe('signInWithPhone', () => {
        it('should send OTP to phone number', async () => {
            mockSignInWithOtp.mockResolvedValue({ data: { user: null, session: null }, error: null });

            const result = await AuthService.signInWithPhone('+2348000000000');

            expect(mockSignInWithOtp).toHaveBeenCalledWith({
                phone: '+2348000000000'
            });
            expect(result.error).toBeNull();
        });
    });

    describe('verifyPhoneOTP', () => {
        it('should verify OTP and return user', async () => {
            mockVerifyOtp.mockResolvedValue({
                data: { user: { id: 'user-123' }, session: { access_token: 'token' } },
                error: null
            });

            const result = await AuthService.verifyPhoneOTP('+2348000000000', '123456');

            expect(mockVerifyOtp).toHaveBeenCalledWith({
                phone: '+2348000000000',
                token: '123456',
                type: 'sms'
            });
            expect(result.data.user?.id).toBe('user-123');
        });
    });

    describe('getProfile', () => {
        it('should fetch user profile if session exists', async () => {
            mockGetSession.mockResolvedValue({
                data: { session: { user: { id: 'user-123' } } },
                error: null
            });

            const result = await AuthService.getProfile();

            expect(result?.id).toBe('user-123');
            expect(result?.role).toBe('owner');
        });

        it('should return null if no session', async () => {
            mockGetSession.mockResolvedValue({
                data: { session: null },
                error: null
            });

            const result = await AuthService.getProfile();
            expect(result).toBeNull();
        });
    });

    describe('signOut', () => {
        it('should sign out the current user', async () => {
            mockSignOut.mockResolvedValue({ error: null });

            await AuthService.signOut();

            expect(mockSignOut).toHaveBeenCalled();
        });
    });
});
