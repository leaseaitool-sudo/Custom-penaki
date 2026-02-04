import React from 'react';
import { Workbench } from '../shared/Workbench';
import { Lease, AbstractedData } from '../../types';

interface ReviewerWorkbenchProps {
  lease: Lease | null;
  onBack: () => void;
  onSaveDraft: (leaseId: string, data: AbstractedData, timeSpent?: number) => Promise<void>;
  onSubmitReview: (leaseId: string, data: AbstractedData, notes?: string, timeSpent?: number) => Promise<void>;
}

export const ReviewerWorkbench: React.FC<ReviewerWorkbenchProps> = (props) => {
    return <Workbench mode="reviewer" {...props} />;
};