import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Role } from '@/shared/types';

import * as authService from '@/features/auth/api/authService';

// ---- Context Types ----

interface AuthContextType {
    /** The currently authenticated user (null if not logged in) */
    currentUser: User | null;
    /** True while the initial session check is in progress */
    isAuthLoading: boolean;
    /** Sign in with email/password. Returns error message or null on success. */
    signIn: (email: string, password: string) => Promise<string | null>;
    /** Sign up with username/email/password. Returns error message or null on success. */
    signUp: (email: string, password: string, username: string) => Promise<string | null>;
    /** Sign out the current user. */
    signOut: () => Promise<void>;
    /** Update the local user object (e.g. after profile edits). Does NOT persist to DB. */
    updateLocalUser: (user: User) => void;
    /** Set user directly (used for impersonation and legacy compat) */
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---- Provider ----

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const isMounted = useRef(true);

    // Initial session check on mount
    useEffect(() => {
        isMounted.current = true;

        const initSession = async () => {
            try {
                const user = await authService.getCurrentUser();
                if (isMounted.current) {
                    setCurrentUser(user);
                }
            } catch (err) {
                console.error('Auth init failed:', err);
            } finally {
                if (isMounted.current) {
                    setIsAuthLoading(false);
                }
            }
        };

        initSession();

        return () => {
            isMounted.current = false;
        };
    }, []);

    // ---- Auth Actions ----

    const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
        const result = await authService.signIn(email, password);
        if (result.success && result.user) {
            setCurrentUser(result.user);
            return null;
        }
        return result.error || 'Login failed.';
    }, []);

    const signUp = useCallback(async (email: string, password: string, username: string): Promise<string | null> => {
        const result = await authService.signUp(email, password, username);
        if (result.success && result.user) {
            setCurrentUser(result.user);
            return null;
        }
        return result.error || 'Sign up failed.';
    }, []);

    const signOut = useCallback(async () => {
        await authService.signOut();
        setCurrentUser(null);
    }, []);

    const updateLocalUser = useCallback((updates: Partial<User>) => {
        setCurrentUser(prev => {
            if (!prev) return null;
            // SECURITY: Prevent role/id/email spoofing via local updates
            // Only allow safe fields like username, preferences, etc.
            const safeUpdates = { ...updates };
            delete (safeUpdates as any).id;
            delete (safeUpdates as any).role;
            delete (safeUpdates as any).email;

            return { ...prev, ...safeUpdates };
        });
    }, []);

    return (
        <AuthContext.Provider value={{
            currentUser,
            isAuthLoading,
            signIn,
            signUp,
            signOut,
            updateLocalUser,
            setCurrentUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// ---- Hook ----

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
};
