import { useAuthStore } from '@/stores/auth.store';
import React, { createContext, useContext, useEffect } from 'react';

type AuthStoreType = ReturnType<typeof useAuthStore>;

const AuthContext = createContext<AuthStoreType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuthStore();

    useEffect(() => {
        // Initialize auth on mount
        auth.initialize();
    }, []);

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthStoreType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
