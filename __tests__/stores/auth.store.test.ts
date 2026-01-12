import { supabaseHelpers } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { act, renderHook } from '@testing-library/react-native';

// Mock the supabase module
jest.mock('@/lib/supabase');

describe('AuthStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        const { result } = renderHook(() => useAuthStore());
        act(() => {
            result.current.signOut();
        });
        jest.clearAllMocks();
    });

    describe('signInWithOTP', () => {
        it('should call supabaseHelpers.signInWithOTP with phone number', async () => {
            const { result } = renderHook(() => useAuthStore());
            const mockPhone = '+919876543210';

            (supabaseHelpers.signInWithOTP as jest.Mock).mockResolvedValue({ error: null });

            await act(async () => {
                await result.current.signInWithOTP(mockPhone);
            });

            expect(supabaseHelpers.signInWithOTP).toHaveBeenCalledWith(mockPhone);
        });

        it('should return error when OTP sign in fails', async () => {
            const { result } = renderHook(() => useAuthStore());
            const mockError = new Error('Invalid phone number');

            (supabaseHelpers.signInWithOTP as jest.Mock).mockResolvedValue({ error: mockError });

            let response;
            await act(async () => {
                response = await result.current.signInWithOTP('+919876543210');
            });

            expect(response).toHaveProperty('error', mockError);
        });
    });

    describe('verifyOTP', () => {
        it('should set authenticated state on successful verification', async () => {
            const { result } = renderHook(() => useAuthStore());
            const mockSession = { access_token: 'test-token' };
            const mockUser = { id: 'user-123', phone: '+919876543210' };

            (supabaseHelpers.verifyOTP as jest.Mock).mockResolvedValue({
                data: { session: mockSession, user: mockUser },
                error: null,
            });

            (supabaseHelpers.getProfile as jest.Mock).mockResolvedValue({
                data: { id: 'user-123', full_name: 'Test User' },
                error: null,
            });

            (supabaseHelpers.getUserRoles as jest.Mock).mockResolvedValue({
                data: [{ id: 'role-1', role: 'guard', society_id: 'society-1' }],
                error: null,
            });

            await act(async () => {
                await result.current.verifyOTP('+919876543210', '123456');
            });

            expect(result.current.isAuthenticated).toBe(true);
            expect(result.current.user).toEqual(mockUser);
        });
    });

    describe('signOut', () => {
        it('should clear all auth state', async () => {
            const { result } = renderHook(() => useAuthStore());

            // Set some initial state
            await act(async () => {
                result.current.user = { id: 'user-123' } as any;
                result.current.isAuthenticated = true;
            });

            (supabaseHelpers.signOut as jest.Mock).mockResolvedValue({});

            await act(async () => {
                await result.current.signOut();
            });

            expect(result.current.user).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.profile).toBeNull();
            expect(result.current.roles).toEqual([]);
        });
    });

    describe('setCurrentRole', () => {
        it('should update current role', () => {
            const { result } = renderHook(() => useAuthStore());
            const mockRole = {
                id: 'role-1',
                role: 'guard' as const,
                society_id: 'society-1',
                unit_id: null,
            };

            act(() => {
                result.current.setCurrentRole(mockRole);
            });

            expect(result.current.currentRole).toEqual(mockRole);
        });
    });
});
