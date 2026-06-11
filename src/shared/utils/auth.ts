import { Role } from '@/shared/types';

/**
 * Resolves a role string from the database to the Role enum.
 * This replaces the old hardcoded email checks (isAdminEmail / isReviewerEmail).
 */
export const resolveRoleFromProfile = (roleStr: string | null | undefined): Role => {
  if (!roleStr) return Role.USER;
  switch (roleStr.toLowerCase()) {
    case 'super_admin': return Role.SUPER_ADMIN;
    case 'admin': return Role.ADMIN;
    case 'reviewer': return Role.REVIEWER;
    case 'user': return Role.USER;
    default: return Role.USER;
  }
};
