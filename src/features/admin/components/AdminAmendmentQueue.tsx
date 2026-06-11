
import React from 'react';
import { Lease, User, LeaseStatus } from '@/shared/types';
import { AdminReviewQueue } from '@/features/admin/components/AdminReviewQueue';

interface AdminAmendmentQueueProps {
  leases: Lease[];
  reviewers: User[];
  onStartReview: (lease: Lease) => void;
  onAssignLease: (lease: Lease, reviewer: User) => void;
  currentUser: User | null;
  notification?: { type: 'success' | 'error'; message: string } | null;
  onClearNotification?: () => void;
}

export const AdminAmendmentQueue: React.FC<AdminAmendmentQueueProps> = (props) => {
    const amendmentLeases = props.leases.filter(l => l.status === LeaseStatus.AMENDMENT_REVIEW);
    
    return (
        <div className="max-w-[95rem] mx-auto">
            <h2 className="text-2xl font-bold text-text-main mb-6 px-4">Amendment Review Queue</h2>
            <AdminReviewQueue 
                {...props} 
                leases={amendmentLeases} 
            />
        </div>
    );
};
