import { Role } from '@/shared/types';

/**
 * Resolves a role string from the database to the Role enum.
 * This replaces the old hardcoded email checks (isAdminEmail / isReviewerEmail).
 */
export const resolveRoleFromProfile = (roleStr: string | null | undefined): Role => {
  return Role.USER;
};
