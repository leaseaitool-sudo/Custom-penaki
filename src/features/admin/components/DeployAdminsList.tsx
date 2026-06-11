
import React, { useState } from 'react';
import { Organization, User, Role } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { BuildingOfficeIcon } from '@/shared/ui/Icons/BuildingOfficeIcon';
import { PlusCircleIcon } from '@/shared/ui/Icons/PlusCircleIcon';
import { UserCircleIcon } from '@/shared/ui/Icons/UserCircleIcon';
import { CheckBadgeIcon } from '@/shared/ui/Icons/CheckBadgeIcon';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { XCircleIcon } from '@/shared/ui/Icons/XCircleIcon';
import { ArrowRightIcon } from '@/shared/ui/Icons/ArrowRightIcon';
import { LockClosedIcon } from '@/shared/ui/Icons/LockClosedIcon';

interface DeployAdminsListProps {
    organizations: Organization[];
    users: User[]; // To count users per org, etc.
    onCreateOrg: (orgName: string, adminName: string, adminEmail: string, adminPass: string) => void;
    onManageOrg: (org: Organization) => void;
    onLoginAs: (org: Organization) => void;
}

export const DeployAdminsList: React.FC<DeployAdminsListProps> = ({ organizations, users, onCreateOrg, onManageOrg, onLoginAs }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newOrgName, setNewOrgName] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPass, setAdminPass] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newOrgName && adminName && adminEmail && adminPass) {
            onCreateOrg(newOrgName, adminName, adminEmail, adminPass);
            setIsCreating(false);
            setNewOrgName(''); setAdminName(''); setAdminEmail(''); setAdminPass('');
        }
    };

    const filteredOrgs = organizations.filter(org => 
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ScrollAnimatedSection className="max-w-[95rem] mx-auto p-4 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-black text-text-main tracking-tight uppercase flex items-center gap-3">
                        <BuildingOfficeIcon className="w-10 h-10 text-purple-600" />
                        Deploy Admins
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage tenant organizations and outsourcing partners.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all hover:-translate-y-0.5"
                >
                    <PlusCircleIcon className="w-5 h-5" /> Create Organization
                </button>
            </div>

            {isCreating && (
                <div className="bg-white p-8 rounded-2xl border border-border shadow-xl animate-slide-up max-w-4xl mx-auto ring-4 ring-purple-50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-text-main">New Organization Setup</h3>
                        <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organization Details</h4>
                                <div>
                                    <label className="block text-sm font-medium text-text-light mb-1">Organization Name</label>
                                    <input 
                                        type="text" required value={newOrgName} onChange={e => setNewOrgName(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="e.g. Apex Abstractions Inc."
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Admin User</h4>
                                <div>
                                    <label className="block text-sm font-medium text-text-light mb-1">Admin Name</label>
                                    <input 
                                        type="text" required value={adminName} onChange={e => setAdminName(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-light mb-1">Email (Login ID)</label>
                                    <input 
                                        type="email" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="admin@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-light mb-1">Temporary Password</label>
                                    <input 
                                        type="password" required value={adminPass} onChange={e => setAdminPass(e.target.value)}
                                        className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="********"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border flex justify-end gap-3">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 border border-border rounded-lg font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button type="submit" className="px-8 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 shadow-md">Create & Deploy</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between">
                    <div className="relative max-w-sm w-full">
                        <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Search organizations..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Total: {organizations.length}
                    </div>
                </div>
                
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Organization</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Limit</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border">
                        {filteredOrgs.map(org => (
                            <tr key={org.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {org.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{org.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">ID: {org.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${org.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${org.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        {org.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                    {org.planType}
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-mono text-slate-600">
                                    {org.maxReviewers}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => onLoginAs(org)}
                                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="Impersonate Admin"
                                        >
                                            <LockClosedIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => onManageOrg(org)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:border-purple-300 hover:text-purple-700 shadow-sm transition-all"
                                        >
                                            Manage <ArrowRightIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredOrgs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No organizations found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </ScrollAnimatedSection>
    );
};
