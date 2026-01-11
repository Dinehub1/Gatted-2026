import { supabase, supabaseHelpers } from '@/lib/supabase';
import type { Profile, UserRoleType } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

export interface UserRoleData {
    id: string;
    role: UserRoleType;
    society_id: string | null;
    unit_id: string | null;
    society?: {
        id: string;
        name: string;
    } | null;
}

export interface AuthState {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    roles: UserRoleData[];
    currentRole: UserRoleData | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    // Actions
    signInWithOTP: (phone: string) => Promise<{ error: any }>;
    verifyOTP: (phone: string, token: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    loadUserData: () => Promise<void>;
    setCurrentRole: (role: UserRoleData) => void;
    initialize: () => Promise<void>;
    devLogin: (role: UserRoleType) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    profile: null,
    roles: [],
    currentRole: null,
    isLoading: true,
    isAuthenticated: false,

    signInWithOTP: async (phone: string) => {
        try {
            const { error } = await supabaseHelpers.signInWithOTP(phone);

            if (error) {
                console.error('OTP sign in error:', error);
                return { error };
            }

            return { error: null };
        } catch (error) {
            console.error('OTP sign in error:', error);
            return { error };
        }
    },

    verifyOTP: async (phone: string, token: string) => {
        try {
            const { data, error } = await supabaseHelpers.verifyOTP(phone, token);

            if (error) {
                console.error('OTP verification error:', error);
                return { error };
            }

            if (data.session && data.user) {
                set({
                    session: data.session,
                    user: data.user,
                    isAuthenticated: true,
                });

                // Load user data after successful verification
                await get().loadUserData();
            }

            return { error: null };
        } catch (error) {
            console.error('OTP verification error:', error);
            return { error };
        }
    },

    signOut: async () => {
        try {
            await supabaseHelpers.signOut();
            await AsyncStorage.removeItem('current_role');

            set({
                user: null,
                session: null,
                profile: null,
                roles: [],
                currentRole: null,
                isAuthenticated: false,
            });
        } catch (error) {
            console.error('Sign out error:', error);
        }
    },

    loadUserData: async () => {
        try {
            const { user } = get();
            if (!user) return;

            // Load profile
            const { data: profile, error: profileError } = await supabaseHelpers.getProfile(user.id);

            if (profileError) {
                console.error('Error loading profile:', profileError);
                return;
            }

            // Load roles
            const { data: roles, error: rolesError } = await supabaseHelpers.getUserRoles(user.id);

            if (rolesError) {
                console.error('Error loading roles:', rolesError);
                return;
            }

            set({ profile, roles: roles || [] });

            // Auto-select role if only one exists
            if (roles && roles.length === 1) {
                get().setCurrentRole(roles[0]);
            } else if (roles && roles.length > 1) {
                // Try to load previously selected role
                const savedRoleId = await AsyncStorage.getItem('current_role');
                const savedRole = roles.find(r => r.id === savedRoleId);
                if (savedRole) {
                    get().setCurrentRole(savedRole);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },

    setCurrentRole: (role: UserRoleData) => {
        set({ currentRole: role });
        AsyncStorage.setItem('current_role', role.id);
    },

    // Dev Login - Uses real Supabase email/password auth with test credentials
    devLogin: async (role: UserRoleType) => {
        const credentials: Record<UserRoleType, { email: string; password: string }> = {
            guard: { email: 'guard@test.com', password: 'test1234' },
            resident: { email: 'resident@test.com', password: 'test1234' },
            manager: { email: 'manager@test.com', password: 'test1234' },
            admin: { email: 'admin@test.com', password: 'test1234' },
            owner: { email: 'resident@test.com', password: 'test1234' },
            tenant: { email: 'resident@test.com', password: 'test1234' },
        };

        const cred = credentials[role];
        if (!cred) {
            console.error('No test credentials for role:', role);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: cred.email,
                password: cred.password,
            });

            if (error) {
                console.error('Dev login error:', error);
                return;
            }

            if (data.session && data.user) {
                set({
                    session: data.session,
                    user: data.user,
                    isAuthenticated: true,
                });

                // Load user data after successful login
                await get().loadUserData();
            }
        } catch (error) {
            console.error('Dev login error:', error);
        }
    },

    initialize: async () => {
        try {
            set({ isLoading: true });

            // Check for existing session
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                set({
                    session,
                    user: session.user,
                    isAuthenticated: true,
                });

                await get().loadUserData();
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (_event, session) => {
                set({
                    session,
                    user: session?.user ?? null,
                    isAuthenticated: !!session?.user,
                });

                if (session?.user) {
                    await get().loadUserData();
                } else {
                    set({
                        profile: null,
                        roles: [],
                        currentRole: null,
                    });
                }
            });

            set({ isLoading: false });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ isLoading: false });
        }
    },
}));
