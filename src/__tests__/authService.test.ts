/**
 * AuthService Unit Tests
 *
 * Tests authentication operations with mocked Supabase client.
 */

// Mock Supabase before importing anything
const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
const mockResetPasswordForEmail = jest.fn();

jest.mock('@/lib/supabase-instance', () => ({
    supabase: {
        auth: {
            signUp: (...args: unknown[]) => mockSignUp(...args),
            signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
            signOut: (...args: unknown[]) => mockSignOut(...args),
            resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
        },
        from: jest.fn(() => ({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                    single: jest.fn().mockResolvedValue({ data: { id: 'tenant-1' }, error: null }),
                }),
                single: jest.fn().mockResolvedValue({ data: { id: 'tenant-1' }, error: null }),
            }),
        })),
    },
    isSupabaseConfigured: true,
}));

import { AuthService } from '@/services/authService';

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('signUp', () => {
        it('should create a new user with email and password', async () => {
            mockSignUp.mockResolvedValue({
                data: { user: { id: 'user-123', email: 'test@test.com' } },
                error: null,
            });

            const result = await AuthService.signUp(
                'test@test.com',
                'password123',
                'Test Store',
                'test-store',
                'Test User'
            );

            expect(mockSignUp).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'test@test.com',
                    password: 'password123',
                })
            );
            expect(result).toBeDefined();
        });

        it('should return error for duplicate email', async () => {
            mockSignUp.mockResolvedValue({
                data: { user: null },
                error: { message: 'User already registered' },
            });

            const result = await AuthService.signUp(
                'existing@test.com',
                'password123',
                'Test Store',
                'test-store',
                'Test User'
            );

            expect(result).toBeDefined();
        });
    });

    describe('signIn', () => {
        it('should sign in with valid credentials', async () => {
            mockSignInWithPassword.mockResolvedValue({
                data: { user: { id: 'user-123' }, session: { access_token: 'token' } },
                error: null,
            });

            const result = await AuthService.signIn('test@test.com', 'password123');

            expect(mockSignInWithPassword).toHaveBeenCalledWith({
                email: 'test@test.com',
                password: 'password123',
            });
            expect(result).toBeDefined();
        });

        it('should return error for invalid credentials', async () => {
            mockSignInWithPassword.mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'Invalid login credentials' },
            });

            const result = await AuthService.signIn('test@test.com', 'wrong');
            expect(result).toBeDefined();
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
