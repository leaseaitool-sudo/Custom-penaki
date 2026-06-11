import React from 'react';
import { Workbench } from '@/features/leases/components/workbench/Workbench';
import { Lease, AbstractedData } from '@/shared/types';

interface AdminWorkbenchProps {
  lease: Lease | null;
  onBack: () => void;
  onSaveDraft: (leaseId: string, data: AbstractedData, timeSpent?: number) => Promise<void>;
  onSubmitReview: (leaseId: string, data: AbstractedData, notes?: string, timeSpent?: number, skipR2?: boolean) => Promise<{ success: boolean; }>;
}

export const AdminWorkbench: React.FC<AdminWorkbenchProps> = (props) => {
  return <Workbench mode="admin" {...props} />;
};