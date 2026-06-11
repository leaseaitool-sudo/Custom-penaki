import { User, Role } from '@/shared/types';
import { resolveRole } from '@/features/auth/api/authService';

export interface ManagedUser {
    id: string;
    email: string;
    username: string;
    role: string;
    dailyCapacity?: number;
    dailyGoal?: number;
    createdAt?: string;
}

export interface UserManagementResult {
    success: boolean;
    error?: string;
    userId?: string;
    user?: ManagedUser;
}

const toUser = (m: ManagedUser): User => ({
    id: m.id,
    email: m.email,
    username: m.username,
    role: resolveRole(m.role),
    dailyCapacity: m.dailyCapacity,
    dailyGoal: m.dailyGoal ?? 5,
});

let mockManagedUsers: ManagedUser[] = [];

export const createManagedUser = async (params: {
    email: string;
    password: string;
    username: string;
    role: 'user' | 'reviewer' | 'admin' | 'super_admin';
}): Promise<UserManagementResult & { appUser?: User }> => {
    const newUser: ManagedUser = {
        id: `usr_${Date.now()}`,
        email: params.email,
        username: params.username,
        role: params.role,
    };
    mockManagedUsers.push(newUser);
    return {
        success: true,
        userId: newUser.id,
        user: newUser,
        appUser: toUser(newUser),
    };
};

export const deleteManagedUser = async (userId: string): Promise<UserManagementResult> => {
    mockManagedUsers = mockManagedUsers.filter(u => u.id !== userId);
    return { success: true };
};

export const updateManagedUserProfile = async (
    userId: string,
    updates: {
        username?: string;
        email?: string;
        role?: string;
        daily_capacity?: number;
        daily_goal?: number;
    }
): Promise<UserManagementResult> => {
    const user = mockManagedUsers.find(u => u.id === userId);
    if (user) {
        if (updates.username) user.username = updates.username;
        if (updates.email) user.email = updates.email;
        if (updates.role) user.role = updates.role;
        if (updates.daily_capacity !== undefined) user.dailyCapacity = updates.daily_capacity;
        if (updates.daily_goal !== undefined) user.dailyGoal = updates.daily_goal;
    }
    return { success: true };
};

export const listAllUsers = async (page = 1, perPage = 500): Promise<{
    success: boolean;
    users: User[];
    rawUsers: ManagedUser[];
    total: number;
    error?: string;
}> => {
    return {
        success: true,
        users: mockManagedUsers.map(toUser),
        rawUsers: mockManagedUsers,
        total: mockManagedUsers.length,
    };
};

export const listReviewers = async (): Promise<User[]> => {
    return mockManagedUsers.map(toUser).filter(u => u.role === Role.REVIEWER);
};

export const listAdmins = async (): Promise<User[]> => {
    return mockManagedUsers.map(toUser).filter(u => u.role === Role.ADMIN || u.role === Role.SUPER_ADMIN);
};
