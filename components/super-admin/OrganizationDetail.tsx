
import React, { useState } from 'react';
import { Organization, OrganizationMember, OrganizationClient, User, Role } from '../../types';
import { ScrollAnimatedSection } from '../ScrollAnimatedSection';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { BuildingOfficeIcon } from '../icons/BuildingOfficeIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { CheckBadgeIcon } from '../icons/CheckBadgeIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';

interface OrganizationDetailProps {
    org: Organization;
    orgMembers: OrganizationMember[];
    orgClients: OrganizationClient[];
    allUsers: User[]; // Global user list to pick from
    onBack: () => void;
    onAddMember: (userId: string, role: Role) => void; // Usually creates new user or invites
    onMapClient: (clientUserId: string) => void;
    onUnmapClient: (clientUserId: string) => void;
    onRemoveMember: (userId: string) => void;
}

export const OrganizationDetail: React.FC<OrganizationDetailProps> = ({ 
    org, orgMembers, orgClients, allUsers, onBack, onAddMember, onMapClient, onUnmapClient, onRemoveMember 
}) => {
    const [activeTab, setActiveTab] = useState<'clients' | 'workforce'>('clients');
    const [isAddingClient, setIsAddingClient] = useState(false);
    const [clientSearch, setClientSearch] = useState('');

    // Filtered lists
    const members = allUsers.filter(u => orgMembers.some(m => m.userId === u.email));
    const managedClients = allUsers.filter(u => orgClients.some(c => c.clientUserId === u.email && c.status === 'Active'));
    
    // Candidates for mapping (Users who are Role.USER and NOT currently mapped to this org)
    // Note: In a real system, a client might be mapped to multiple orgs or just one. Assuming one active map here for simplicity.
    const availableClients = allUsers.filter(u => 
        u.role === Role.USER && 
        !orgClients.some(c => c.clientUserId === u.email && c.status === 'Active') &&
        (u.username.toLowerCase().includes(clientSearch.toLowerCase()) || u.email.toLowerCase().includes(clientSearch.toLowerCase()))
    );

    return (
        <ScrollAnimatedSection className="max-w-[95rem] mx-auto p-4 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-text-main tracking-tight uppercase flex items-center gap-3">
                        <BuildingOfficeIcon className="w-8 h-8 text-purple-600" />
                        {org.name}
                    </h1>
                    <div className="flex items-center gap-4 mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${org.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {org.status}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">ID: {org.id}</span>
                        <span className="text-xs text-slate-500 font-medium">Plan: {org.planType}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-purple-600">
                        <UsersIcon className="w-5 h-5" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Managed Clients</h4>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{managedClients.length} <span className="text-sm font-medium text-slate-400">/ {org.maxClients}</span></p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2 text-blue-600">
                        <BriefcaseIcon className="w-5 h-5" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Workforce</h4>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{members.length} <span className="text-sm font-medium text-slate-400">/ {org.maxReviewers}</span></p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden min-h-[500px]">
                <div className="flex border-b border-border">
                    <button 
                        onClick={() => setActiveTab('clients')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'clients' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Client Mapping
                    </button>
                    <button 
                        onClick={() => setActiveTab('workforce')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'workforce' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Workforce (Reviewers)
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'clients' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800">Assigned Clients</h3>
                                <button 
                                    onClick={() => setIsAddingClient(!isAddingClient)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${isAddingClient ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'}`}
                                >
                                    {isAddingClient ? 'Cancel Assignment' : 'Map New Client'}
                                </button>
                            </div>

                            {isAddingClient && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-slide-up">
                                    <input 
                                        type="text" 
                                        placeholder="Search unmapped clients by name or email..." 
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm mb-4"
                                        value={clientSearch}
                                        onChange={e => setClientSearch(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {availableClients.map(client => (
                                            <div key={client.email} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800">{client.username}</p>
                                                    <p className="text-xs text-slate-500">{client.email}</p>
                                                </div>
                                                <button 
                                                    onClick={() => { onMapClient(client.email); setIsAddingClient(false); setClientSearch(''); }}
                                                    className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded hover:bg-green-100 border border-green-200"
                                                >
                                                    Map to Org
                                                </button>
                                            </div>
                                        ))}
                                        {availableClients.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No matching clients found.</p>}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {managedClients.map(client => (
                                    <div key={client.email} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-slate-600 font-bold">
                                                {client.username.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{client.username}</p>
                                                <p className="text-xs text-slate-500">{client.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 flex items-center gap-1">
                                                <CheckBadgeIcon className="w-3 h-3" /> Mapped
                                            </span>
                                            <button 
                                                onClick={() => { if(window.confirm('Unmap client? They will return to global pool.')) onUnmapClient(client.email); }}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                title="Unmap Client"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {managedClients.length === 0 && <p className="text-center text-slate-400 py-12 italic">No clients currently mapped to this organization.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'workforce' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800">Organization Members</h3>
                                {/* Simple text note as creating users is complex in this mock view */}
                                <p className="text-xs text-slate-400 italic">To add members, use "Login As" to enter Admin Dashboard</p>
                            </div>
                            <div className="space-y-2">
                                {members.map(member => {
                                    const memberRecord = orgMembers.find(m => m.userId === member.email);
                                    return (
                                        <div key={member.email} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                                                    {member.username.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 flex items-center gap-2">
                                                        {member.username}
                                                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${memberRecord?.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {memberRecord?.role === Role.ADMIN ? 'Admin' : 'Reviewer'}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-slate-500">{member.email}</p>
                                                </div>
                                            </div>
                                            {/* Only show remove for non-admins or if multiple admins exist to prevent lockout - simplified here */}
                                            <button 
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                title="Remove Member"
                                                onClick={() => { if(window.confirm('Remove user from organization?')) onRemoveMember(member.email); }}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ScrollAnimatedSection>
    );
};
