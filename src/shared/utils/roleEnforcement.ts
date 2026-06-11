import { User, Role, Lease } from '@/shared/types';

/**
 * Validates if a user can access the Admin Dashboard and features.
 */
export const canAccessAdminPanel = (user: User | null | undefined): boolean => {
    if (!user) return false;
    return user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
};

/**
 * Validates if an admin can perform super-admin specific actions (like deploying new orgs).
 */
export const isSuperAdmin = (user: User | null | undefined): boolean => {
    if (!user) return false;
    return user.role === Role.SUPER_ADMIN;
};

/**
 * Validates if the user is assigned as the R1 reviewer for this lease.
 * Uses UUID IDs (not email) for robustness — email can change via updateProfile.
 */
export const isAssignedR1 = (user: User | null | undefined, lease: Lease | null | undefined): boolean => {
    if (!user || !lease) return false;
    return lease.reviewer?.id === user.id;
};

/**
 * Validates if the user is assigned as the R2 reviewer for this lease.
 * Uses UUID IDs (not email) for robustness — email can change via updateProfile.
 */
export const isAssignedR2 = (user: User | null | undefined, lease: Lease | null | undefined): boolean => {
    if (!user || !lease) return false;
    return lease.reviewerR2?.id === user.id;
};

/**
 * Validates if a user can verify R2 fields (must be explicitly assigned R2 or an Admin).
 */
export const canVerifyR2 = (user: User | null | undefined, lease: Lease | null | undefined): boolean => {
    if (canAccessAdminPanel(user)) return true;
    return isAssignedR2(user, lease);
};

/**
 * Returns the scoped leases a user is allowed to see.
 * Uses UUIDs for reviewer matching — email-based comparison is fragile.
 */
export const getScopedLeases = (user: User | null | undefined, allLeases: Lease[]): Lease[] => {
    if (!user) return [];
    if (canAccessAdminPanel(user)) return allLeases;
    if (user.role === Role.USER) {
        return allLeases.filter(l => l.user && l.user.id === user.id);
    }
    if (user.role === Role.REVIEWER) {
        return allLeases.filter(l =>
            (l.reviewer && l.reviewer.id === user.id) ||
            (l.reviewerR2 && l.reviewerR2.id === user.id)
        );
    }
    return [];
};
