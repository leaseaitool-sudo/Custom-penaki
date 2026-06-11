import { Organization, OrganizationMember, OrganizationClient, User, Role } from '@/shared/types';

let mockOrgs: Organization[] = [];
let mockMembers: OrganizationMember[] = [];
let mockClients: OrganizationClient[] = [];

export const fetchOrganizations = async (): Promise<Organization[]> => mockOrgs;
export const fetchOrgMembers = async (orgId?: string): Promise<OrganizationMember[]> => orgId ? mockMembers.filter(m => m.organizationId === orgId) : mockMembers;
export const fetchOrgClients = async (orgId?: string): Promise<OrganizationClient[]> => orgId ? mockClients.filter(c => c.organizationId === orgId) : mockClients;

export const createOrganization = async (org: Organization, adminEmail: string): Promise<boolean> => {
    mockOrgs.push(org);
    mockMembers.push({ id: `mem_${Date.now()}`, organizationId: org.id, userId: adminEmail, role: Role.ADMIN, status: 'Active' });
    return true;
};

export const addReviewerToOrg = async (orgId: string, email: string): Promise<boolean> => {
    mockMembers.push({ id: `mem_${Date.now()}`, organizationId: orgId, userId: email, role: Role.REVIEWER, status: 'Active' });
    return true;
};

export const removeMemberFromOrg = async (orgId: string, email: string): Promise<boolean> => {
    mockMembers = mockMembers.filter(m => !(m.organizationId === orgId && m.userId === email));
    return true;
};

export const mapClientToOrg = async (orgId: string, clientEmail: string): Promise<boolean> => {
    mockClients.push({ id: `map_${Date.now()}`, organizationId: orgId, clientUserId: clientEmail, assignedAt: new Date(), status: 'Active' });
    return true;
};

export const unmapClientFromOrg = async (orgId: string, clientEmail: string): Promise<boolean> => {
    mockClients = mockClients.filter(c => !(c.organizationId === orgId && c.clientUserId === clientEmail));
    return true;
};
