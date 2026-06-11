import React from 'react';
import { User, Lease, ReviewStatus } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { UsersIcon } from '@/shared/ui/Icons/UsersIcon';

interface AdminClientsProps {
  clients: User[];
  leases: Lease[];
  onSelectClient: (client: User) => void;
}

export const AdminClients: React.FC<AdminClientsProps> = ({ clients, leases, onSelectClient }) => {

  if (clients.length === 0) {
    return (
      <ScrollAnimatedSection tag="div" className="text-center py-20 bg-surface border border-border rounded-2xl">
        <UsersIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-text-main">No clients found.</h3>
        <p className="mt-2 text-text-light">No users have submitted leases for review yet.</p>
      </ScrollAnimatedSection>
    );
  }

  return (
    <ScrollAnimatedSection tag="div">
      <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 rounded-xl">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-muted">
            <tr>
              {['Client Name', 'Email Address', 'Total Leases', 'Pending Review'].map(header => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-border">
            {clients.map(client => {
              const clientLeases = leases.filter(l => l.user?.email === client.email);
              const totalLeases = clientLeases.length;
              const pendingReviews = clientLeases.filter(l => l.processingMode === 'human' && l.reviewStatus === ReviewStatus.PENDING).length;
              const hasNewLeases = clientLeases.some(l => (new Date().getTime() - l.uploadDate.getTime()) < 24 * 60 * 60 * 1000);

              return (
                <tr 
                  key={client.email} 
                  onClick={() => onSelectClient(client)}
                  className="hover:bg-surface-muted transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">
                    <div className="flex items-center gap-2">
                        <span>{client.username}</span>
                        {hasNewLeases && <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" title="Has new uploads"></span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-text-main">{totalLeases}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-text-main">
                    <span className={`px-2.5 py-1 rounded-full text-xs ${pendingReviews > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {pendingReviews}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ScrollAnimatedSection>
  );
};