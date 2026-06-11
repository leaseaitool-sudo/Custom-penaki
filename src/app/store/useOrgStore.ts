import { create } from 'zustand';
import { Organization, OrganizationMember, OrganizationClient, SupportChat, User } from '@/shared/types';

interface OrgState {
    organizations: Organization[];
    orgMembers: OrganizationMember[];
    orgClients: OrganizationClient[];
    selectedOrgForDetail: Organization | null;
    selectedClient: User | null;
    supportChats: SupportChat[];
    
    // Actions
    setOrganizations: (orgs: Organization[]) => void;
    setOrgMembers: (members: OrganizationMember[]) => void;
    setOrgClients: (clients: OrganizationClient[]) => void;
    setSelectedOrgForDetail: (org: Organization | null) => void;
    setSelectedClient: (client: User | null) => void;
    setSupportChats: (chats: SupportChat[]) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
    organizations: [],
    orgMembers: [],
    orgClients: [],
    selectedOrgForDetail: null,
    selectedClient: null,
    supportChats: [],
    
    setOrganizations: (orgs) => set({ organizations: orgs }),
    setOrgMembers: (members) => set({ orgMembers: members }),
    setOrgClients: (clients) => set({ orgClients: clients }),
    setSelectedOrgForDetail: (org) => set({ selectedOrgForDetail: org }),
    setSelectedClient: (client) => set({ selectedClient: client }),
    setSupportChats: (chats) => set({ supportChats: chats }),
}));
