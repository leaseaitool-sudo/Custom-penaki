import { User, Role } from '@/shared/types';

export const resolveRole = (roleStr: string | null | undefined): Role => {
    return Role.SUPER_ADMIN; // Mocking all users as super admins to bypass restrictions
};

export const roleToString = (role: Role): string => {
    return 'super_admin';
};

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

const mockUser: User = {
    id: 'mock-user-id',
    username: 'Admin User',
    email: 'admin@penaki.ai',
    role: Role.SUPER_ADMIN,
    savedTemplates: [],
    dailyGoal: 5,
};

export const signIn = async (email: string, password: string): Promise<AuthResult> => {
    localStorage.setItem('mock_auth', 'true');
    return { success: true, user: mockUser };
};

export const signUp = async (email: string, password: string, username: string): Promise<AuthResult> => {
    localStorage.setItem('mock_auth', 'true');
    return { success: true, user: mockUser };
};

export const signOut = async (): Promise<void> => {
    localStorage.removeItem('mock_auth');
};

export const getCurrentUser = async (): Promise<User | null> => {
    if (localStorage.getItem('mock_auth') === 'true') {
        return mockUser;
    }
    return null;
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
    return { success: true };
};

export const verifyCurrentPassword = async (
    email: string,
    currentPassword: string
): Promise<{ valid: boolean; error?: string }> => {
    return { valid: true };
};

export const updatePassword = async (
    newPassword: string
): Promise<{ success: boolean; error?: string }> => {
    return { success: true };
};
