import React from 'react';
import { Workbench } from '@/features/leases/components/workbench/Workbench';
import { Lease, AbstractedData } from '@/shared/types';

interface ReviewerWorkbenchProps {
  lease: Lease | null;
  onBack: () => void;
  onSaveDraft: (leaseId: string, data: AbstractedData, timeSpent?: number) => Promise<void>;
  onSubmitReview: (leaseId: string, data: AbstractedData, notes?: string, timeSpent?: number, skipR2?: boolean) => Promise<{ success: boolean; }>;
}

export const ReviewerWorkbench: React.FC<ReviewerWorkbenchProps> = (props) => {
  return <Workbench mode="reviewer" {...props} />;
};