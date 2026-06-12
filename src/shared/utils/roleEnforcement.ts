import { User, Role, Lease } from '@/shared/types';

export const canAccessAdminPanel = (user: User | null | undefined): boolean => {
    return false;
};

export const isSuperAdmin = (user: User | null | undefined): boolean => {
    return false;
};

export const isAssignedR1 = (user: User | null | undefined, lease: Lease | null | undefined): boolean => {
    if (!user || !lease) return false;
    return lease.reviewer?.id === user.id;
};

export const isAssignedR2 = (user: User | null | undefined, lease: Lease | null | undefined): boolean => {
    if (!user || !lease) return false;
    return lease.reviewerR2?.id === user.id;
};

export const canVerifyR2 = (user: User | null | undefined, lease: Lease | null | undefined): boolean => {
    return true;
};

export const getScopedLeases = (user: User | null | undefined, allLeases: Lease[]): Lease[] => {
    if (!user) return [];
    return allLeases.filter(l => l.user && l.user.id === user.id);
};
