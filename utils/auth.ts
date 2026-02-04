
/**
 * Checks if the given email address is designated as a super admin email.
 * @param email The email address to check.
 * @returns True if the email is a super admin email, false otherwise.
 */
export const isAdminEmail = (email: string): boolean => {
  // In this mock, we treat the primary dev email as super admin
  return email.toLowerCase() === 'pinaki@gmail.com';
};

/**
 * Checks if the given email address is designated as a reviewer email.
 * @param email The email address to check.
 * @returns True if the email is a reviewer email, false otherwise.
 */
export const isReviewerEmail = (email: string): boolean => {
  return email.toLowerCase() === 'penaki@gmail.com';
};
