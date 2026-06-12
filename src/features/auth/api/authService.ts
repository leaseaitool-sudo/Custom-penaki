import { User, Role } from '@/shared/types';
import { supabase } from '@/shared/lib/supabase';

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

export const resolveRole = (roleStr: string | null | undefined): Role => {
    return Role.USER;
};

export const roleToString = (role: Role): string => {
    return 'user';
};

const mapSupabaseUser = async (authUser: any): Promise<User | null> => {
    if (!authUser) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }

    return {
        id: profile.id,
        email: profile.email,
        username: profile.username || 'User',
        role: resolveRole(profile.role),
        savedTemplates: profile.saved_templates || [],
        dailyGoal: profile.daily_goal || 5,
    };
};

export const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const user = await mapSupabaseUser(data.user);
        if (!user) throw new Error('Failed to fetch user profile');
        
        return { success: true, user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const signUp = async (email: string, password: string, username: string): Promise<AuthResult> => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        });
        
        if (error) throw error;
        
        // Polling loop in case the trigger takes a moment to create the profile
        let user = null;
        for (let i = 0; i < 5; i++) {
            user = await mapSupabaseUser(data.user);
            if (user) break;
            await new Promise(r => setTimeout(r, 500));
        }

        if (!user) throw new Error('Profile creation failed or timed out.');
        
        return { success: true, user };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return mapSupabaseUser(session.user);
};

export interface ProfileUpdateResult {
    success: boolean;
    error?: string;
    emailConfirmationRequired?: boolean;
}

export const updateProfile = async (
    userId: string,
    updates: { username?: string; email?: string }
): Promise<ProfileUpdateResult> => {
    try {
        if (updates.username) {
            const { error } = await supabase
                .from('profiles')
                .update({ username: updates.username })
                .eq('id', userId);
            if (error) throw error;
        }
        
        if (updates.email) {
            const { error } = await supabase.auth.updateUser({ email: updates.email });
            if (error) throw error;
            return { success: true, emailConfirmationRequired: true };
        }
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};

export const verifyCurrentPassword = async (
    email: string,
    currentPassword: string
): Promise<{ valid: boolean; error?: string }> => {
    try {
        const { error } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
        if (error) throw error;
        return { valid: true };
    } catch (error: any) {
        return { valid: false, error: error.message };
    }
};

export const updatePassword = async (
    newPassword: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
};
